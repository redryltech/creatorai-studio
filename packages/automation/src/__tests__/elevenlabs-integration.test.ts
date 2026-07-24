// ============================================================
// CreatorAI Studio — ElevenLabs Voice Integration Tests
// ============================================================
// Verifies real voice generation via ElevenLabs TTS API.
//
// REQUIRES: ELEVENLABS_API_KEY environment variable
// COST: ~$0.002 per test (short text)
// Skips automatically if no API key is set.
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ElevenLabsVoiceMediaProvider } from '../media/providers/elevenlabs-voice.provider';
import { MediaProviderRegistry } from '../media/registry/media-provider-registry';
import { Logger, LogLevel, CostTracker } from '@creatorai/agents';

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY ?? '';
const SKIP = !ELEVENLABS_KEY;

const describeIf = SKIP ? describe.skip : describe;

describeIf('ElevenLabs Voice Integration — Real API Calls', () => {
  let provider: ElevenLabsVoiceMediaProvider;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });
    provider = new ElevenLabsVoiceMediaProvider({
      apiKey: ELEVENLABS_KEY,
      defaultVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
      defaultModel: 'eleven_multilingual_v2',
      timeoutMs: 30000,
    });

    const registry = MediaProviderRegistry.getInstance();
    registry.register(provider);
  });

  afterAll(() => {
    MediaProviderRegistry.resetInstance();
    CostTracker.resetInstance();
  });

  // ---- Provider Availability ----

  it('reports provider as available', async () => {
    expect(await provider.isAvailable()).toBe(true);
  });

  it('passes health check', async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThan(0);
    expect(health.latencyMs).toBeLessThan(10000);
  }, 15000);

  // ---- Cost Estimation ----

  it('estimates cost based on character count', () => {
    const cost = provider.estimateCost({ text: 'Hello world, this is a test.' });
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(0.01); // Short text should be cheap
  });

  it('scales cost with text length', () => {
    const short = provider.estimateCost({ text: 'Hi' });
    const long = provider.estimateCost({ text: 'This is a much longer piece of text that should cost more to generate.' });
    expect(long).toBeGreaterThan(short);
  });

  // ---- Real Voice Generation ----

  it('generates real audio with default voice (Adam)', async () => {
    const result = await provider.generate({
      text: 'Hello, this is a test of the CreatorAI Studio voice generation system.',
      voiceId: 'adam',
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.buffer).not.toBeNull();
    expect(result.buffer!.length).toBeGreaterThan(1000); // Audio should be at least 1KB
    expect(result.provider).toBe('elevenlabs_voice');
    expect(result.model).toBe('eleven_multilingual_v2');
    expect(result.duration).toBeGreaterThan(0);
    expect(result.costUsd).toBeGreaterThan(0);

    // Verify metadata
    const meta = result.metadata as Record<string, unknown>;
    expect(meta.voiceId).toBeTruthy();
    expect(meta.textLength).toBe(70);
    expect(meta.sizeBytes).toBeGreaterThan(0);
    expect(meta.format).toBe('mp3');

    // Verify it's valid MP3 data (starts with ID3 or sync bytes)
    const header = result.buffer!.slice(0, 3).toString('ascii');
    const isMP3 = header === 'ID3' || (result.buffer![0] === 0xFF && (result.buffer![1]! & 0xE0) === 0xE0);
    expect(isMP3).toBe(true);
  }, 30000);

  it('generates with a different voice (Rachel)', async () => {
    const result = await provider.generate({
      text: 'Testing with a different voice.',
      voiceId: 'rachel',
    });

    expect(result.success).toBe(true);
    expect(result.buffer).not.toBeNull();
    expect(result.buffer!.length).toBeGreaterThan(500);
    expect((result.metadata as Record<string, unknown>).voiceName).toBe('rachel');
  }, 30000);

  it('generates with custom voice settings', async () => {
    const result = await provider.generate({
      text: 'Custom voice settings test.',
      voiceId: 'adam',
      stability: 0.8,
      similarityBoost: 0.9,
      style: 0.3,
    });

    expect(result.success).toBe(true);
    expect(result.buffer).not.toBeNull();
    const meta = result.metadata as Record<string, unknown>;
    expect(meta.stability).toBe(0.8);
    expect(meta.similarityBoost).toBe(0.9);
  }, 30000);

  // ---- Duration Estimation ----

  it('estimates reasonable duration from buffer size', async () => {
    const result = await provider.generate({
      text: 'This is approximately ten seconds of speech when read at a normal pace by an AI voice.',
      voiceId: 'adam',
    });

    expect(result.success).toBe(true);
    // Duration should be roughly 4-12 seconds for this text
    expect(result.duration).toBeGreaterThan(2);
    expect(result.duration).toBeLessThan(20);
  }, 30000);

  // ---- Error Handling ----

  it('rejects empty text', async () => {
    await expect(provider.generate({ text: '' })).rejects.toThrow('Text is required');
  });

  it('rejects very short text', async () => {
    await expect(provider.generate({ text: 'a' })).rejects.toThrow('Text is required');
  });

  // ---- MediaProviderRegistry Integration ----

  it('is discoverable through MediaProviderRegistry', async () => {
    const registry = MediaProviderRegistry.getInstance();
    const voiceProvider = await registry.getPrimary('voice');
    expect(voiceProvider).toBeDefined();
    expect(voiceProvider!.providerId).toBe('elevenlabs_voice');
  });

  it('generates through MediaProviderRegistry', async () => {
    const registry = MediaProviderRegistry.getInstance();
    const voiceProvider = await registry.getPrimary('voice');
    expect(voiceProvider).toBeDefined();

    const result = await voiceProvider!.generate({
      text: 'Registry test complete.',
      voiceId: 'adam',
    });

    expect(result.success).toBe(true);
    expect(result.buffer).not.toBeNull();
  }, 30000);
});
