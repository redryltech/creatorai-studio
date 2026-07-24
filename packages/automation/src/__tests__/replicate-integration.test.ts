// ============================================================
// CreatorAI Studio — Replicate Image Integration Tests
// ============================================================
// Verifies real image generation via Replicate API.
//
// REQUIRES: REPLICATE_API_TOKEN environment variable
// COST: ~$0.003 per test (using flux-schnell)
// Skips automatically if no API token is set.
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ReplicateImageMediaProvider } from '../media/providers/replicate-image.provider';
import { MediaProviderRegistry } from '../media/registry/media-provider-registry';
import { Logger, LogLevel, CostTracker } from '@creatorai/agents';

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN ?? '';
const SKIP = !REPLICATE_TOKEN;

const describeIf = SKIP ? describe.skip : describe;

describeIf('Replicate Image Integration — Real API Calls', () => {
  let provider: ReplicateImageMediaProvider;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });
    provider = new ReplicateImageMediaProvider({
      apiToken: REPLICATE_TOKEN,
      defaultModel: 'flux-schnell', // Cheapest for testing
      timeoutMs: 120000,
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
    const available = await provider.isAvailable();
    expect(available).toBe(true);
  });

  it('passes health check', async () => {
    const health = await provider.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThan(0);
    expect(health.latencyMs).toBeLessThan(10000);
  }, 15000);

  // ---- Cost Estimation ----

  it('estimates cost correctly for flux-schnell', () => {
    const cost = provider.estimateCost({ model: 'flux-schnell' });
    expect(cost).toBe(0.003);
  });

  it('estimates cost correctly for flux-pro-1.1', () => {
    const cost = provider.estimateCost({ model: 'flux-pro-1.1' });
    expect(cost).toBe(0.05);
  });

  // ---- Real Image Generation ----

  it('generates a real image with flux-schnell', async () => {
    const result = await provider.generate({
      prompt: 'A simple red circle on a white background, minimal, flat design',
      width: 512,
      height: 512,
      model: 'flux-schnell',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
    expect(result.url).toMatch(/^https?:\/\//);
    expect(result.error).toBeNull();
    expect(result.provider).toBe('replicate_image');
    expect(result.model).toBe('flux-schnell');
    expect(result.costUsd).toBe(0.003);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.metadata).toBeDefined();
    expect((result.metadata as Record<string, unknown>).predictionId).toBeTruthy();

    // Verify the URL actually returns an image
    const imageResp = await fetch(result.url!);
    expect(imageResp.ok).toBe(true);
    const contentType = imageResp.headers.get('content-type');
    expect(contentType).toMatch(/image\//);
  }, 120000);

  it('generates with negative prompt', async () => {
    const result = await provider.generate({
      prompt: 'A futuristic city skyline at sunset, cinematic, photorealistic',
      negativePrompt: 'blurry, low quality, text, watermark',
      width: 768,
      height: 512,
      model: 'flux-schnell',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  }, 120000);

  it('generates with custom style', async () => {
    const result = await provider.generate({
      prompt: 'A mountain landscape',
      style: 'anime style, studio ghibli, vibrant colors',
      width: 512,
      height: 512,
      model: 'flux-schnell',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
    // Style should be appended to prompt
    expect((result.metadata as Record<string, unknown>).prompt).toContain('anime');
  }, 120000);

  // ---- Error Handling ----

  it('returns failure for empty prompt', async () => {
    await expect(provider.generate({ prompt: '' })).rejects.toThrow('Prompt is required');
  });

  it('returns failure for unknown model', async () => {
    await expect(provider.generate({ prompt: 'test', model: 'nonexistent-model' }))
      .rejects.toThrow('Unknown model');
  });

  // ---- MediaProviderRegistry Integration ----

  it('is discoverable through MediaProviderRegistry', async () => {
    const registry = MediaProviderRegistry.getInstance();
    const imageProvider = await registry.getPrimary('image');
    expect(imageProvider).toBeDefined();
    expect(imageProvider!.providerId).toBe('replicate_image');
  });

  it('generates through MediaProviderRegistry', async () => {
    const registry = MediaProviderRegistry.getInstance();
    const imageProvider = await registry.getPrimary('image');
    expect(imageProvider).toBeDefined();

    const result = await imageProvider!.generate({
      prompt: 'A blue square on a gray background, minimal',
      width: 256,
      height: 256,
      model: 'flux-schnell',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  }, 120000);
});
