// ============================================================
// CreatorAI Studio — Cost Tracker
// ============================================================
// Tracks the cost of every AI operation in real-time.
//
// Why this is critical:
// - Users need to see cost per project/video
// - We need cost data for plan enforcement (free/pro/enterprise limits)
// - Business needs aggregate cost data for margin analysis
// - Anomaly detection: alert if a single pipeline costs > $X
//
// Architecture:
// - In-memory accumulator for current pipeline
// - Writes to Firestore asynchronously (non-blocking)
// - Model pricing table updated periodically
// ============================================================

import type { CostRecord, ModelPricing, TokenUsage } from '@creatorai/shared';
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '../logger';

const log = Logger.for('CostTracker');

/**
 * Known model pricing as of July 2026.
 * Updated periodically from provider pricing pages.
 * Prices in USD.
 */
const MODEL_PRICING: ModelPricing[] = [
  // OpenAI
  { providerId: 'openai', model: 'gpt-4o', inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01, perImage: null, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'openai', model: 'gpt-4o-mini', inputPer1kTokens: 0.00015, outputPer1kTokens: 0.0006, perImage: null, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'openai', model: 'gpt-4.1', inputPer1kTokens: 0.002, outputPer1kTokens: 0.008, perImage: null, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'openai_dalle', model: 'dall-e-3', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: 0.04, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'openai_tts', model: 'tts-1', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: null, perSecondVideo: null, perCharacterVoice: 0.000015, lastUpdated: new Date() },
  { providerId: 'openai_tts', model: 'tts-1-hd', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: null, perSecondVideo: null, perCharacterVoice: 0.00003, lastUpdated: new Date() },

  // Anthropic
  { providerId: 'anthropic', model: 'claude-sonnet-4-20250514', inputPer1kTokens: 0.003, outputPer1kTokens: 0.015, perImage: null, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'anthropic', model: 'claude-3-5-haiku-20241022', inputPer1kTokens: 0.0008, outputPer1kTokens: 0.004, perImage: null, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },

  // Replicate (Flux)
  { providerId: 'replicate', model: 'flux-pro-1.1', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: 0.05, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },
  { providerId: 'replicate', model: 'flux-schnell', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: 0.003, perSecondVideo: null, perCharacterVoice: null, lastUpdated: new Date() },

  // ElevenLabs
  { providerId: 'elevenlabs', model: 'eleven_multilingual_v2', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: null, perSecondVideo: null, perCharacterVoice: 0.00018, lastUpdated: new Date() },

  // Runway
  { providerId: 'runway', model: 'gen-3-alpha-turbo', inputPer1kTokens: 0, outputPer1kTokens: 0, perImage: null, perSecondVideo: 0.05, perCharacterVoice: null, lastUpdated: new Date() },
];

export class CostTracker {
  private static instance: CostTracker | null = null;
  private pricing: Map<string, ModelPricing> = new Map();
  private records: CostRecord[] = [];
  private flushCallback: ((records: CostRecord[]) => Promise<void>) | null = null;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Index pricing by "provider:model"
    for (const p of MODEL_PRICING) {
      this.pricing.set(`${p.providerId}:${p.model}`, p);
    }
  }

  static getInstance(): CostTracker {
    if (!CostTracker.instance) {
      CostTracker.instance = new CostTracker();
    }
    return CostTracker.instance;
  }

  static resetInstance(): void {
    if (CostTracker.instance?.flushInterval) {
      clearInterval(CostTracker.instance.flushInterval);
    }
    CostTracker.instance = null;
  }

  /**
   * Set the callback for persisting cost records to the database.
   * Records are batched and flushed periodically to avoid per-call writes.
   */
  setFlushCallback(callback: (records: CostRecord[]) => Promise<void>, intervalMs: number = 10000): void {
    this.flushCallback = callback;

    if (this.flushInterval) clearInterval(this.flushInterval);
    this.flushInterval = setInterval(() => this.flush(), intervalMs);
  }

  /**
   * Calculate and record the cost of an LLM completion.
   */
  trackLLMUsage(params: {
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    tokens: TokenUsage;
  }): CostRecord {
    const pricing = this.getPricing(params.providerId, params.model);
    const cost = pricing
      ? (params.tokens.inputTokens / 1000) * pricing.inputPer1kTokens +
        (params.tokens.outputTokens / 1000) * pricing.outputPer1kTokens
      : 0;

    return this.record({
      ...params,
      operation: 'llm_completion',
      tokens: params.tokens,
      costUsd: cost,
    });
  }

  /**
   * Record the cost of image generation.
   */
  trackImageGeneration(params: {
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    imageCount: number;
  }): CostRecord {
    const pricing = this.getPricing(params.providerId, params.model);
    const cost = pricing?.perImage ? pricing.perImage * params.imageCount : 0;

    return this.record({
      ...params,
      operation: 'image_generation',
      tokens: null,
      costUsd: cost,
      metadata: { imageCount: params.imageCount },
    });
  }

  /**
   * Record the cost of video generation.
   */
  trackVideoGeneration(params: {
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    durationSeconds: number;
  }): CostRecord {
    const pricing = this.getPricing(params.providerId, params.model);
    const cost = pricing?.perSecondVideo ? pricing.perSecondVideo * params.durationSeconds : 0;

    return this.record({
      ...params,
      operation: 'video_generation',
      tokens: null,
      costUsd: cost,
      metadata: { durationSeconds: params.durationSeconds },
    });
  }

  /**
   * Record the cost of voice synthesis.
   */
  trackVoiceSynthesis(params: {
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    characterCount: number;
  }): CostRecord {
    const pricing = this.getPricing(params.providerId, params.model);
    const cost = pricing?.perCharacterVoice ? pricing.perCharacterVoice * params.characterCount : 0;

    return this.record({
      ...params,
      operation: 'voice_synthesis',
      tokens: null,
      costUsd: cost,
      metadata: { characterCount: params.characterCount },
    });
  }

  /**
   * Get total cost for a pipeline.
   */
  getPipelineCost(pipelineId: string): number {
    return this.records
      .filter((r) => r.pipelineId === pipelineId)
      .reduce((sum, r) => sum + r.costUsd, 0);
  }

  /**
   * Get total cost for a user in the current month.
   */
  getUserMonthlyCost(userId: string): number {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.records
      .filter((r) => r.userId === userId && r.timestamp >= startOfMonth)
      .reduce((sum, r) => sum + r.costUsd, 0);
  }

  /**
   * Flush accumulated records to persistent storage.
   */
  async flush(): Promise<void> {
    if (this.records.length === 0 || !this.flushCallback) return;

    const batch = [...this.records];
    this.records = [];

    try {
      await this.flushCallback(batch);
      log.debug('Flushed cost records', { count: batch.length });
    } catch (error) {
      // Put records back on failure — don't lose cost data
      this.records.unshift(...batch);
      log.error('Failed to flush cost records', { count: batch.length }, error as Error);
    }
  }

  /**
   * Update pricing for a model (e.g., when a provider changes prices).
   */
  updatePricing(pricing: ModelPricing): void {
    this.pricing.set(`${pricing.providerId}:${pricing.model}`, pricing);
    log.info('Updated model pricing', {
      providerId: pricing.providerId,
      model: pricing.model,
    });
  }

  // ---- Private ----

  private getPricing(providerId: string, model: string): ModelPricing | undefined {
    return this.pricing.get(`${providerId}:${model}`);
  }

  private record(params: {
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    operation: CostRecord['operation'];
    tokens: TokenUsage | null;
    costUsd: number;
    metadata?: Record<string, unknown>;
  }): CostRecord {
    const record: CostRecord = {
      id: generateId(ID_PREFIXES.step),
      userId: params.userId,
      projectId: params.projectId,
      pipelineId: params.pipelineId,
      agentId: params.agentId,
      providerId: params.providerId,
      model: params.model,
      operation: params.operation,
      tokens: params.tokens,
      costUsd: params.costUsd,
      metadata: params.metadata ?? {},
      timestamp: new Date(),
    };

    this.records.push(record);

    log.debug('Cost recorded', {
      agentId: params.agentId,
      providerId: params.providerId,
      model: params.model,
      operation: params.operation,
      costUsd: params.costUsd.toFixed(6),
    });

    return record;
  }
}
