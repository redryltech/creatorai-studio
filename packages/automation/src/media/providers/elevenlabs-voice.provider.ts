// ============================================================
// CreatorAI Studio — ElevenLabs Voice Media Provider
// ============================================================
// Implements IMediaProvider for real ElevenLabs TTS API.
// Used by the Sprint 2 VoiceGenerationAgent via MediaProviderRegistry.
//
// The ElevenLabs TTS endpoint returns raw audio bytes.
// This provider returns the audio buffer and a temporary URL.
// The VoiceGenerationAgent is responsible for uploading to
// Firebase Storage if persistent storage is needed.
//
// Features:
//   ✅ Real ElevenLabs API calls (POST /text-to-speech/{voiceId})
//   ✅ Multiple voice presets (Adam, Rachel, Josh, etc.)
//   ✅ Multilingual v2 model support
//   ✅ Configurable stability, similarity, style
//   ✅ Cost tracking (per character)
//   ✅ Duration estimation from buffer size
//   ✅ Retry and timeout (via caller)
//   ✅ Health check via /voices endpoint
// ============================================================

import { Logger, CostTracker } from '@creatorai/agents';
import type { IMediaProvider, ProviderResponse } from '../types/media.types';

const log = Logger.for('ElevenLabsVoiceProvider');
const API_BASE = 'https://api.elevenlabs.io/v1';

/** Voice presets — map friendly names to ElevenLabs voice IDs. */
const VOICE_PRESETS: Record<string, string> = {
  adam:    'pNInz6obpgDQGcFmaJgB',
  rachel:  '21m00Tcm4TlvDq8ikWAM',
  domi:    'AZnzlk1XvdvUeBnXmlld',
  bella:   'EXAVITQu4vr4xnSDxMaL',
  josh:    'TxGEqnHWrfWFTfGW9XjX',
  arnold:  'VR6AewLTigWG4xSOukaG',
  sam:     'yoZ06aMxZJJ28mfd3POQ',
};

export interface ElevenLabsVoiceConfig {
  apiKey: string;
  defaultVoiceId?: string;
  defaultModel?: string;
  timeoutMs?: number;
}

export class ElevenLabsVoiceMediaProvider implements IMediaProvider {
  readonly providerId = 'elevenlabs_voice';
  readonly providerName = 'ElevenLabs TTS';
  readonly mediaType = 'voice' as const;
  readonly priority = 0;

  private readonly apiKey: string;
  private readonly defaultVoiceId: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(config: ElevenLabsVoiceConfig) {
    this.apiKey = config.apiKey;
    this.defaultVoiceId = config.defaultVoiceId ?? 'pNInz6obpgDQGcFmaJgB'; // Adam
    this.defaultModel = config.defaultModel ?? 'eleven_multilingual_v2';
    this.timeoutMs = config.timeoutMs ?? 60000;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  estimateCost(request: Record<string, unknown>): number {
    const text = (request.text as string) ?? '';
    // ElevenLabs pricing: ~$0.30 per 1K characters (Starter plan)
    // Actual cost depends on plan; we use a conservative estimate
    return text.length * 0.00018;
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      const resp = await fetch(`${API_BASE}/voices`, {
        headers: { 'xi-api-key': this.apiKey },
        signal: AbortSignal.timeout(10000),
      });
      return { healthy: resp.ok, latencyMs: Math.round(performance.now() - start) };
    } catch {
      return { healthy: false, latencyMs: Math.round(performance.now() - start) };
    }
  }

  /**
   * Generate real speech audio using the ElevenLabs TTS API.
   *
   * @param request — Must include: text.
   *   Optional: voiceId (name or ID), language, speed, stability,
   *   similarityBoost, style, outputFormat, model.
   * @returns ProviderResponse with audio buffer and metadata.
   */
  async generate(request: Record<string, unknown>): Promise<ProviderResponse> {
    const text = request.text as string;
    if (!text || text.trim().length < 2) throw new Error('Text is required (min 2 characters)');

    const voiceInput = (request.voiceId as string) ?? this.defaultVoiceId;
    const voiceId = VOICE_PRESETS[voiceInput.toLowerCase()] ?? voiceInput;
    const model = (request.model as string) ?? this.defaultModel;
    const outputFormat = (request.outputFormat as string) ?? 'mp3_44100_128';

    // Voice settings
    const stability = (request.stability as number) ?? 0.5;
    const similarityBoost = (request.similarityBoost as number) ?? 0.75;
    const style = (request.style as number) ?? 0.0;
    const speed = (request.speed as number) ?? 1.0;

    log.info('Voice generation starting', {
      voiceId,
      model,
      textLength: text.length,
      speed,
    });

    const startTime = performance.now();

    try {
      // ---- Call ElevenLabs TTS API ----
      const url = `${API_BASE}/text-to-speech/${voiceId}`;

      const body = {
        text,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error('ElevenLabs TTS failed', { status: response.status, error: errorText });
        return this.failureResponse(`HTTP ${response.status}: ${errorText}`, model, performance.now() - startTime);
      }

      // ---- Read audio buffer ----
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      if (audioBuffer.length === 0) {
        return this.failureResponse('Empty audio response', model, performance.now() - startTime);
      }

      // ---- Estimate duration from buffer size ----
      // MP3 at 128kbps: 1 second ≈ 16,000 bytes
      const estimatedDuration = audioBuffer.length / 16000;
      const generationTimeMs = Math.round(performance.now() - startTime);
      const costUsd = text.length * 0.00018;

      // ---- Track cost ----
      CostTracker.getInstance().trackVoiceSynthesis({
        userId: 'system',
        projectId: null,
        pipelineId: null,
        agentId: 'elevenlabs_voice',
        providerId: this.providerId,
        model,
        characterCount: text.length,
      });

      log.info('Voice generated successfully', {
        voiceId,
        model,
        textLength: text.length,
        durationSec: estimatedDuration.toFixed(1),
        sizeBytes: audioBuffer.length,
        generationTimeMs,
        costUsd: costUsd.toFixed(4),
      });

      return {
        success: true,
        url: null, // No URL yet — buffer needs upload to Firebase Storage
        buffer: audioBuffer,
        duration: estimatedDuration,
        metadata: {
          voiceId,
          voiceName: Object.entries(VOICE_PRESETS).find(([, id]) => id === voiceId)?.[0] ?? voiceId,
          model,
          textLength: text.length,
          sizeBytes: audioBuffer.length,
          format: 'mp3',
          stability,
          similarityBoost,
          style,
          speed,
          language: (request.language as string) ?? 'en',
        },
        costUsd,
        provider: this.providerId,
        model,
        error: null,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error('ElevenLabs API error', {}, error instanceof Error ? error : undefined);
      return this.failureResponse(errorMsg, model, performance.now() - startTime);
    }
  }

  // ---- Helpers ----

  private failureResponse(error: string, model: string, elapsedMs: number): ProviderResponse {
    return {
      success: false, url: null, buffer: null, duration: elapsedMs / 1000,
      metadata: {}, costUsd: 0, provider: this.providerId, model, error,
    };
  }
}
