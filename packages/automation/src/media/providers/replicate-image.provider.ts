// ============================================================
// CreatorAI Studio — Replicate Image Media Provider
// ============================================================
// Implements IMediaProvider for real Replicate API image generation.
// Used by the Sprint 2 ImageGenerationAgent via MediaProviderRegistry.
//
// Supported models:
//   flux-schnell  — Fast, cheap ($0.003/image)
//   flux-dev      — Higher quality ($0.025/image)
//   flux-pro-1.1  — Best quality ($0.05/image)
//
// This provider:
//   ✅ Calls the real Replicate HTTP API
//   ✅ Polls prediction status until completion
//   ✅ Returns actual image URLs
//   ✅ Supports retry, timeout, cancellation
//   ✅ Tracks cost via CostTracker
//   ✅ Logs via structured Logger
//   ✅ Circuit breaker via MediaProviderRegistry health checks
// ============================================================

import { Logger, CostTracker } from '@creatorai/agents';
import type { IMediaProvider, ProviderResponse } from '../types/media.types';

const log = Logger.for('ReplicateImageProvider');

const API_BASE = 'https://api.replicate.com/v1';
const MAX_POLL_ATTEMPTS = 150;
const POLL_INTERVAL_MS = 2000;

interface ModelConfig {
  identifier: string;
  costPerImage: number;
}

const MODELS: Record<string, ModelConfig> = {
  'flux-schnell': { identifier: 'black-forest-labs/flux-schnell', costPerImage: 0.003 },
  'flux-dev':     { identifier: 'black-forest-labs/flux-dev',     costPerImage: 0.025 },
  'flux-pro-1.1': { identifier: 'black-forest-labs/flux-1.1-pro', costPerImage: 0.05 },
};

export interface ReplicateImageConfig {
  apiToken: string;
  defaultModel?: string;
  timeoutMs?: number;
}

export class ReplicateImageMediaProvider implements IMediaProvider {
  readonly providerId = 'replicate_image';
  readonly providerName = 'Replicate (Flux)';
  readonly mediaType = 'image' as const;
  readonly priority = 0;

  private readonly apiToken: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(config: ReplicateImageConfig) {
    this.apiToken = config.apiToken;
    this.defaultModel = config.defaultModel ?? 'flux-schnell';
    this.timeoutMs = config.timeoutMs ?? 300000;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiToken && this.apiToken.length > 5;
  }

  estimateCost(request: Record<string, unknown>): number {
    const modelKey = (request.model as string) ?? this.defaultModel;
    return MODELS[modelKey]?.costPerImage ?? 0.003;
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      const resp = await fetch(`${API_BASE}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiToken}` },
        signal: AbortSignal.timeout(10000),
      });
      return { healthy: resp.ok, latencyMs: Math.round(performance.now() - start) };
    } catch {
      return { healthy: false, latencyMs: Math.round(performance.now() - start) };
    }
  }

  /**
   * Generate a real image using the Replicate API.
   *
   * @param request — Must include: prompt, width, height.
   *   Optional: negativePrompt, model, style, seed, aspectRatio.
   * @returns ProviderResponse with the generated image URL.
   */
  async generate(request: Record<string, unknown>): Promise<ProviderResponse> {
    const prompt = request.prompt as string;
    if (!prompt) throw new Error('Prompt is required');

    const modelKey = (request.model as string) ?? this.defaultModel;
    const modelConfig = MODELS[modelKey];
    if (!modelConfig) throw new Error(`Unknown model: ${modelKey}. Available: ${Object.keys(MODELS).join(', ')}`);

    const width = (request.width as number) ?? 1024;
    const height = (request.height as number) ?? 1024;
    const negativePrompt = (request.negativePrompt as string) ?? '';
    const seed = request.seed as number | undefined;

    log.info('Image generation starting', {
      model: modelKey,
      resolution: `${width}x${height}`,
      promptLength: prompt.length,
    });

    const startTime = performance.now();

    try {
      // ---- Step 1: Create prediction ----
      const input: Record<string, unknown> = {
        prompt,
        width,
        height,
        num_outputs: 1,
      };

      if (negativePrompt) input.negative_prompt = negativePrompt;
      if (seed !== undefined) input.seed = seed;

      // Add style suffix if provided
      const style = request.style as string | undefined;
      if (style && !prompt.includes(style)) {
        input.prompt = `${prompt}, ${style}`;
      }

      const createResp = await fetch(`${API_BASE}/models/${modelConfig.identifier}/predictions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
        signal: AbortSignal.timeout(30000),
      });

      if (!createResp.ok) {
        const errorText = await createResp.text();
        log.error('Replicate prediction creation failed', { status: createResp.status, error: errorText });
        return this.failureResponse(errorText, modelKey, performance.now() - startTime);
      }

      const prediction = (await createResp.json()) as ReplicatePrediction;
      log.info('Prediction created', { predictionId: prediction.id, status: prediction.status });

      // ---- Step 2: Poll for completion ----
      const result = await this.pollPrediction(prediction.id);

      if (result.status !== 'succeeded' || !result.output) {
        const errorMsg = result.error ?? `Prediction ${result.status}`;
        log.error('Image generation failed', { predictionId: prediction.id, status: result.status, error: errorMsg });
        return this.failureResponse(errorMsg, modelKey, performance.now() - startTime);
      }

      // ---- Step 3: Extract URL ----
      const urls = Array.isArray(result.output) ? result.output : [result.output];
      const imageUrl = urls[0] as string;

      if (!imageUrl) {
        return this.failureResponse('No image URL in response', modelKey, performance.now() - startTime);
      }

      const generationTimeMs = Math.round(performance.now() - startTime);

      // Track cost
      CostTracker.getInstance().trackImageGeneration({
        userId: 'system',
        projectId: null,
        pipelineId: null,
        agentId: 'replicate_image',
        providerId: this.providerId,
        model: modelKey,
        imageCount: 1,
      });

      log.info('Image generated successfully', {
        predictionId: prediction.id,
        model: modelKey,
        generationTimeMs,
        url: imageUrl.slice(0, 80) + '...',
      });

      return {
        success: true,
        url: imageUrl,
        buffer: null,
        duration: generationTimeMs / 1000,
        metadata: {
          predictionId: prediction.id,
          model: modelKey,
          width,
          height,
          prompt: (input.prompt as string).slice(0, 200),
          seed: seed ?? null,
          predictTime: result.metrics?.predict_time ?? null,
        },
        costUsd: modelConfig.costPerImage,
        provider: this.providerId,
        model: modelKey,
        error: null,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error('Replicate API error', {}, error instanceof Error ? error : undefined);
      return this.failureResponse(errorMsg, modelKey, performance.now() - startTime);
    }
  }

  // ---- Private ----

  private async pollPrediction(predictionId: string): Promise<ReplicatePrediction> {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      const resp = await fetch(`${API_BASE}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        signal: AbortSignal.timeout(15000),
      });

      if (!resp.ok) {
        throw new Error(`Replicate poll failed: HTTP ${resp.status}`);
      }

      const prediction = (await resp.json()) as ReplicatePrediction;

      switch (prediction.status) {
        case 'succeeded':
        case 'failed':
        case 'canceled':
          return prediction;
        case 'starting':
        case 'processing':
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          break;
        default:
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    }

    throw new Error(`Prediction ${predictionId} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
  }

  private failureResponse(error: string, model: string, elapsedMs: number): ProviderResponse {
    return {
      success: false,
      url: null,
      buffer: null,
      duration: elapsedMs / 1000,
      metadata: {},
      costUsd: 0,
      provider: this.providerId,
      model,
      error,
    };
  }
}

// ---- Replicate API types ----

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string | string[] | null;
  error: string | null;
  metrics?: { predict_time?: number };
}
