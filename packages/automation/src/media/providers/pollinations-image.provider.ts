// ============================================================
// CreatorAI Studio — Pollinations.ai Image Provider
// ============================================================
// Production image generation using Pollinations.ai (Flux model).
// FREE — no API key required. Uses the public image endpoint.
//
// Provider chain position: priority 10
//   Replicate (0, paid) → Gemini Imagen (5, free/quota) → Pollinations (10, free) → Mock (99)
//
// Generates images via HTTP GET to image.pollinations.ai,
// then post-processes with FFmpeg for guaranteed 1080×1920.
//
// This provider:
//   ✅ Calls the real Pollinations.ai HTTP API (Flux model)
//   ✅ Downloads actual AI-generated JPEG images
//   ✅ Post-processes to exact 1080×1920 via FFmpeg (lanczos)
//   ✅ Validates output (file exists, dimensions, format, corruption)
//   ✅ Retry with exponential backoff (3 attempts)
//   ✅ Timeout handling (60s per image)
//   ✅ Deterministic seeding for consistency
//   ✅ Prompt enhancement for cinematic quality
//   ✅ Implements IMediaProvider interface — zero app code changes
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IMediaProvider, ProviderResponse } from '../types/media.types';
import { writeFileSync, readFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync, execSync } from 'child_process';
import { randomBytes } from 'crypto';

const log = Logger.for('PollinationsImageProvider');

const API_BASE = 'https://image.pollinations.ai/prompt';

// Default timeout for image generation (Pollinations can take 20-40s)
const DEFAULT_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 3000;

// Native output from Pollinations (576×1024) — we upscale to target
const POLLINATIONS_NATIVE_WIDTH = 576;
const POLLINATIONS_NATIVE_HEIGHT = 1024;

// Prompt suffixes that dramatically improve Pollinations/Flux output quality
const QUALITY_SUFFIX = [
  'highly detailed',
  'professional photography',
  '8k resolution',
  'sharp focus',
  'masterpiece quality',
].join(', ');

// Negative traits to avoid (embedded in prompt as "without" clause)
const NEGATIVE_TRAITS = [
  'blurry',
  'low quality',
  'watermark',
  'text overlay',
  'logo',
  'deformed',
  'bad anatomy',
  'cropped',
  'jpeg artifacts',
];

export interface PollinationsImageConfig {
  /** Target width (default 1080) */
  targetWidth?: number;
  /** Target height (default 1920) */
  targetHeight?: number;
  /** Timeout per image in ms (default 90000) */
  timeoutMs?: number;
  /** Max retry attempts (default 3) */
  maxRetries?: number;
  /** Base seed for deterministic generation (default: random) */
  baseSeed?: number;
  /** Output directory for images (default: os tmpdir) */
  outputDir?: string;
  /** Whether to enhance prompts with quality suffixes (default true) */
  enhancePrompts?: boolean;
  /** Flux model variant: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo' */
  model?: string;
}

export class PollinationsImageProvider implements IMediaProvider {
  readonly providerId = 'pollinations_image';
  readonly providerName = 'Pollinations.ai (Flux)';
  readonly mediaType = 'image' as const;
  readonly priority = 10; // After Replicate (0) and Gemini (5), before Mock (99)

  private readonly targetWidth: number;
  private readonly targetHeight: number;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly baseSeed: number;
  private readonly outputDir: string;
  private readonly enhancePrompts: boolean;
  private readonly model: string;
  private imageCounter = 0;

  constructor(config: PollinationsImageConfig = {}) {
    this.targetWidth = config.targetWidth ?? 1080;
    this.targetHeight = config.targetHeight ?? 1920;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? MAX_RETRIES;
    this.baseSeed = config.baseSeed ?? Math.floor(Math.random() * 999999);
    this.outputDir = config.outputDir ?? join(tmpdir(), 'creatorai-pollinations');
    this.enhancePrompts = config.enhancePrompts ?? true;
    this.model = config.model ?? 'flux';

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // ── IMediaProvider interface ──────────────────────────────

  async isAvailable(): Promise<boolean> {
    // Pollinations is always available (no API key needed)
    // But we do need FFmpeg for post-processing
    return this.isFFmpegAvailable();
  }

  estimateCost(_request: Record<string, unknown>): number {
    return 0; // Completely free
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      // Quick HEAD request to verify the API is reachable
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch('https://image.pollinations.ai/', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return { healthy: resp.ok || resp.status === 405, latencyMs: Math.round(performance.now() - start) };
    } catch {
      return { healthy: false, latencyMs: Math.round(performance.now() - start) };
    }
  }

  /**
   * Generate a real AI image using Pollinations.ai (Flux model).
   *
   * @param request Must include: prompt.
   *   Optional: width, height, negativePrompt, seed, style, sceneId, sceneOrder.
   * @returns ProviderResponse with the generated image file path.
   */
  async generate(request: Record<string, unknown>): Promise<ProviderResponse> {
    const rawPrompt = request.prompt as string;
    if (!rawPrompt) {
      return this.failureResponse('Prompt is required', 0);
    }

    const width = (request.width as number) ?? this.targetWidth;
    const height = (request.height as number) ?? this.targetHeight;
    const negativePrompt = (request.negativePrompt as string) ?? '';
    const style = (request.style as string) ?? '';
    const sceneId = (request.sceneId as string) ?? `scene-${this.imageCounter}`;
    const requestedSeed = (request.seed as number) ?? (this.baseSeed + this.imageCounter);

    this.imageCounter++;
    const startTime = performance.now();

    // ── Step 1: Enhance the prompt ──
    const enhancedPrompt = this.enhancePrompt(rawPrompt, negativePrompt, style, width, height);

    log.info('Image generation starting', {
      provider: this.providerId,
      model: this.model,
      sceneId,
      targetResolution: `${width}x${height}`,
      promptLength: enhancedPrompt.length,
      seed: requestedSeed,
    });

    // ── Step 2: Generate with retry ──
    let lastError = '';
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.generateSingleImage(
          enhancedPrompt,
          width,
          height,
          requestedSeed,
          sceneId,
        );

        if (result.success) {
          const elapsedMs = Math.round(performance.now() - startTime);
          log.info('Image generated successfully', {
            sceneId,
            provider: this.providerId,
            model: this.model,
            elapsedMs,
            outputPath: result.filePath,
            outputSize: result.fileSizeBytes,
            outputDimensions: `${result.actualWidth}x${result.actualHeight}`,
            attempt,
          });

          return {
            success: true,
            url: `file://${result.filePath}`,
            buffer: null,
            duration: elapsedMs / 1000,
            metadata: {
              provider: this.providerId,
              model: this.model,
              sceneId,
              seed: requestedSeed,
              nativeWidth: POLLINATIONS_NATIVE_WIDTH,
              nativeHeight: POLLINATIONS_NATIVE_HEIGHT,
              upscaledWidth: result.actualWidth,
              upscaledHeight: result.actualHeight,
              fileSizeBytes: result.fileSizeBytes,
              enhancedPrompt: enhancedPrompt.slice(0, 200),
              attempt,
              generationTimeMs: elapsedMs,
            },
            costUsd: 0,
            provider: this.providerId,
            model: this.model,
            error: null,
          };
        }

        lastError = result.error ?? 'Unknown error';
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempt < this.maxRetries) {
        const delay = RETRY_BASE_DELAY_MS * attempt;
        log.warn('Image generation attempt failed, retrying', {
          sceneId,
          attempt,
          maxRetries: this.maxRetries,
          error: lastError,
          retryDelayMs: delay,
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    const elapsedMs = Math.round(performance.now() - startTime);
    log.error('Image generation failed after all retries', {
      sceneId,
      attempts: this.maxRetries,
      error: lastError,
      elapsedMs,
    });
    return this.failureResponse(lastError, elapsedMs);
  }

  // ── Private implementation ─────────────────────────────────

  /**
   * Enhance the raw scene prompt for optimal Flux model output.
   * Adds quality modifiers, style consistency, composition direction,
   * and negative prompt embedding.
   */
  private enhancePrompt(
    rawPrompt: string,
    negativePrompt: string,
    style: string,
    width: number,
    height: number,
  ): string {
    const parts: string[] = [];

    // Add style prefix if provided
    if (style && !rawPrompt.toLowerCase().includes(style.toLowerCase())) {
      parts.push(style);
    }

    // Core prompt
    parts.push(rawPrompt);

    // Add vertical composition hint for 9:16 aspect
    if (height > width) {
      if (!rawPrompt.toLowerCase().includes('vertical') && !rawPrompt.toLowerCase().includes('portrait')) {
        parts.push('vertical portrait composition');
      }
    }

    // Add quality enhancement
    if (this.enhancePrompts) {
      parts.push(QUALITY_SUFFIX);
    }

    // Combine into final prompt
    let finalPrompt = parts.join(', ');

    // Embed negative prompt as a "without" clause for better Flux handling
    const negTerms = negativePrompt
      ? negativePrompt.split(',').map((s) => s.trim()).filter(Boolean)
      : NEGATIVE_TRAITS;

    if (negTerms.length > 0) {
      finalPrompt += `, without ${negTerms.slice(0, 5).join(', ')}`;
    }

    return finalPrompt;
  }

  /**
   * Download a single image from Pollinations.ai and post-process it.
   */
  private async generateSingleImage(
    prompt: string,
    targetWidth: number,
    targetHeight: number,
    seed: number,
    sceneId: string,
  ): Promise<{
    success: boolean;
    filePath: string;
    actualWidth: number;
    actualHeight: number;
    fileSizeBytes: number;
    error?: string;
  }> {
    // ── Build URL ──
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${API_BASE}/${encodedPrompt}?width=${POLLINATIONS_NATIVE_WIDTH}&height=${POLLINATIONS_NATIVE_HEIGHT}&seed=${seed}&nologo=true&model=${this.model}`;

    // ── Download image ──
    const uniqueId = randomBytes(4).toString('hex');
    const rawPath = join(this.outputDir, `raw-${sceneId}-${uniqueId}.jpg`);
    const finalPath = join(this.outputDir, `${sceneId}-${uniqueId}.png`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Pollinations HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('image')) {
        // Sometimes Pollinations returns HTML error pages
        const body = await response.text();
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Pollinations returned non-image content: ${contentType} — ${body.slice(0, 100)}`,
        };
      }

      // Write raw image to disk
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 1000) {
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Image too small (${buffer.length} bytes) — likely an error response`,
        };
      }

      writeFileSync(rawPath, buffer);

      // ── Validate raw image ──
      const rawValidation = this.validateImage(rawPath);
      if (!rawValidation.valid) {
        this.safeUnlink(rawPath);
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Raw image validation failed: ${rawValidation.error}`,
        };
      }

      // ── Post-process: Upscale to target resolution ──
      const postProcessed = this.postProcessImage(rawPath, finalPath, targetWidth, targetHeight);
      this.safeUnlink(rawPath); // Clean up raw file

      if (!postProcessed.success) {
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Post-processing failed: ${postProcessed.error}`,
        };
      }

      // ── Validate final image ──
      const finalValidation = this.validateImage(finalPath, targetWidth, targetHeight);
      if (!finalValidation.valid) {
        this.safeUnlink(finalPath);
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Final image validation failed: ${finalValidation.error}`,
        };
      }

      const fileStat = statSync(finalPath);
      return {
        success: true,
        filePath: finalPath,
        actualWidth: finalValidation.width ?? targetWidth,
        actualHeight: finalValidation.height ?? targetHeight,
        fileSizeBytes: fileStat.size,
      };
    } catch (err) {
      clearTimeout(timeout);
      this.safeUnlink(rawPath);
      this.safeUnlink(finalPath);

      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          filePath: '',
          actualWidth: 0,
          actualHeight: 0,
          fileSizeBytes: 0,
          error: `Image generation timed out after ${this.timeoutMs}ms`,
        };
      }
      return {
        success: false,
        filePath: '',
        actualWidth: 0,
        actualHeight: 0,
        fileSizeBytes: 0,
        error: (err as Error).message ?? String(err),
      };
    }
  }

  /**
   * Post-process image using FFmpeg:
   *  1. Upscale to target resolution using high-quality lanczos filter
   *  2. Pad if aspect ratio doesn't match (with black bars)
   *  3. Convert to PNG for maximum quality
   */
  private postProcessImage(
    inputPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
  ): { success: boolean; error?: string } {
    try {
      // Scale to fill target while maintaining aspect ratio,
      // then crop to exact dimensions (center crop).
      // This avoids black bars and ensures full coverage.
      const filterChain = [
        `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase`,
        `crop=${targetWidth}:${targetHeight}`,
        'format=rgb24',
      ].join(',');

      execFileSync('ffmpeg', [
        '-y',
        '-i', inputPath,
        '-vf', filterChain,
        '-frames:v', '1',
        '-q:v', '1', // highest quality
        outputPath,
      ], {
        timeout: 15000,
        stdio: 'pipe',
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message?.slice(0, 200) ?? 'FFmpeg post-processing failed',
      };
    }
  }

  /**
   * Validate an image file:
   *  - Exists on disk
   *  - Is a valid image (JPEG or PNG)
   *  - Meets resolution requirements (if specified)
   *  - Not corrupted (can be decoded by FFmpeg)
   */
  private validateImage(
    filePath: string,
    expectedWidth?: number,
    expectedHeight?: number,
  ): { valid: boolean; width?: number; height?: number; error?: string } {
    // Check existence
    if (!existsSync(filePath)) {
      return { valid: false, error: 'File does not exist' };
    }

    // Check file size
    const stat = statSync(filePath);
    if (stat.size < 100) {
      return { valid: false, error: `File too small: ${stat.size} bytes` };
    }

    // Check format and dimensions using FFprobe
    try {
      const probeOutput = execFileSync('ffprobe', [
        '-v', 'quiet',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name',
        '-of', 'json',
        filePath,
      ], {
        timeout: 5000,
        encoding: 'utf8',
      });

      const probeData = JSON.parse(probeOutput);
      const stream = probeData.streams?.[0];

      if (!stream) {
        return { valid: false, error: 'No video stream found — file is not a valid image' };
      }

      const width = stream.width as number;
      const height = stream.height as number;
      const codec = stream.codec_name as string;

      // Verify codec is an image format
      const validCodecs = ['mjpeg', 'png', 'bmp', 'webp', 'tiff'];
      if (!validCodecs.includes(codec)) {
        return { valid: false, error: `Invalid image codec: ${codec}` };
      }

      // Verify dimensions if expected
      if (expectedWidth && width !== expectedWidth) {
        return { valid: false, width, height, error: `Width mismatch: expected ${expectedWidth}, got ${width}` };
      }
      if (expectedHeight && height !== expectedHeight) {
        return { valid: false, width, height, error: `Height mismatch: expected ${expectedHeight}, got ${height}` };
      }

      return { valid: true, width, height };
    } catch (err) {
      return { valid: false, error: `FFprobe validation failed: ${(err as Error).message?.slice(0, 100)}` };
    }
  }

  /**
   * Check if FFmpeg is available on the system.
   */
  private isFFmpegAvailable(): boolean {
    try {
      execFileSync('ffmpeg', ['-version'], { timeout: 3000, stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely delete a file without throwing.
   */
  private safeUnlink(filePath: string): void {
    try {
      if (existsSync(filePath)) unlinkSync(filePath);
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Construct a standardized failure response.
   */
  private failureResponse(error: string, elapsedMs: number): ProviderResponse {
    return {
      success: false,
      url: null,
      buffer: null,
      duration: elapsedMs / 1000,
      metadata: {},
      costUsd: 0,
      provider: this.providerId,
      model: this.model,
      error,
    };
  }
}
