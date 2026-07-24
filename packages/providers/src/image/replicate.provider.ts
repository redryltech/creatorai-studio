// ============================================================
// CreatorAI Studio — Replicate Image Provider
// ============================================================
// Implements IImageProvider using Replicate's HTTP API.
// Primary model: Flux Pro 1.1 (high quality)
// Fallback model: Flux Schnell (fast, cheap)
//
// Replicate uses an async prediction model:
//   POST /predictions → returns prediction ID
//   GET /predictions/{id} → poll until complete
//
// The polling is hidden behind the IImageProvider interface.
// The agent sees a single async call that resolves with images.
// ============================================================

import { BaseProvider } from '../core/base-provider';
import type {
  IImageProvider,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageModel,
} from '../core/provider.interface';
import { sleep } from '@creatorai/shared';

const MODELS: Record<string, { version: string; costPerImage: number }> = {
  'flux-pro-1.1': {
    version: 'black-forest-labs/flux-1.1-pro',
    costPerImage: 0.05,
  },
  'flux-schnell': {
    version: 'black-forest-labs/flux-schnell',
    costPerImage: 0.003,
  },
  'flux-dev': {
    version: 'black-forest-labs/flux-dev',
    costPerImage: 0.025,
  },
};

const DEFAULT_MODEL = 'flux-pro-1.1';
const MAX_POLL_ATTEMPTS = 120;     // 120 * 2s = 4 minutes max wait
const POLL_INTERVAL_MS = 2000;

export class ReplicateImageProvider extends BaseProvider implements IImageProvider {
  readonly id = 'replicate';
  readonly name = 'Replicate';
  readonly version = '1.0.0';

  constructor(apiKey: string) {
    super({
      apiKey,
      baseUrl: 'https://api.replicate.com/v1',
      timeoutMs: 30000,
      maxRetries: 1,  // Replicate is async — retries are at the poll level
    });
  }

  protected getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  async generate(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const modelKey = req.model ?? DEFAULT_MODEL;
    const modelConfig = MODELS[modelKey];
    if (!modelConfig) {
      throw new Error(`Unknown Replicate model: ${modelKey}. Available: ${Object.keys(MODELS).join(', ')}`);
    }

    const startTime = Date.now();
    const count = req.count ?? 1;
    const images: ImageGenerationResponse['images'] = [];

    // Replicate generates one image per prediction for Flux models.
    // For multiple images we run predictions in parallel.
    const predictions = await Promise.all(
      Array.from({ length: count }, () =>
        this.createAndPollPrediction(modelConfig.version, req),
      ),
    );

    for (const prediction of predictions) {
      if (prediction.status === 'succeeded' && prediction.output) {
        // Flux models return output as a string URL or array of URLs
        const urls: string[] = Array.isArray(prediction.output)
          ? prediction.output
          : [prediction.output];

        for (const url of urls) {
          images.push({
            url,
            width: req.width,
            height: req.height,
            seed: null,
          });
        }
      }
    }

    if (images.length === 0) {
      const failedPrediction = predictions.find((p) => p.status === 'failed');
      throw new Error(
        `Image generation failed: ${failedPrediction?.error ?? 'No output returned'}`,
      );
    }

    return {
      images,
      model: modelKey,
      generationTimeMs: Date.now() - startTime,
    };
  }

  async listModels(): Promise<ImageModel[]> {
    return Object.entries(MODELS).map(([id, config]) => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      maxWidth: 2048,
      maxHeight: 2048,
      supportsNegativePrompt: true,
      costPerImage: config.costPerImage,
    }));
  }

  // ---- Private ----

  private async createAndPollPrediction(
    modelVersion: string,
    req: ImageGenerationRequest,
  ): Promise<ReplicatePrediction> {
    // Create prediction
    const input: Record<string, unknown> = {
      prompt: req.prompt,
      width: req.width,
      height: req.height,
    };

    if (req.negativePrompt) {
      input.negative_prompt = req.negativePrompt;
    }
    if (req.guidanceScale !== undefined) {
      input.guidance_scale = req.guidanceScale;
    }
    if (req.seed !== undefined) {
      input.seed = req.seed;
    }

    // Replicate's official model format uses the model identifier directly
    const prediction = await this.request<ReplicatePrediction>('/models/' + modelVersion + '/predictions', {
      method: 'POST',
      body: { input },
    });

    // Poll for completion
    return this.pollPrediction(prediction.id);
  }

  private async pollPrediction(predictionId: string): Promise<ReplicatePrediction> {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      const prediction = await this.request<ReplicatePrediction>(
        `/predictions/${predictionId}`,
        { method: 'GET' },
      );

      switch (prediction.status) {
        case 'succeeded':
          return prediction;
        case 'failed':
        case 'canceled':
          return prediction;
        case 'starting':
        case 'processing':
          await sleep(POLL_INTERVAL_MS);
          break;
        default:
          await sleep(POLL_INTERVAL_MS);
      }
    }

    throw new Error(`Replicate prediction ${predictionId} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
  }
}

// ---- Replicate API types ----

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string | string[] | null;
  error: string | null;
  metrics?: {
    predict_time?: number;
  };
}
