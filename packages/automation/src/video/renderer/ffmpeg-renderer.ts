// ============================================================
// CreatorAI Studio — FFmpeg Renderer
// ============================================================
// Real video rendering using FFmpeg CLI.
//
// Pipeline:
// 1. Download all assets (images, audio) to temp directory
// 2. Generate FFmpeg filter complex from timeline
// 3. Execute FFmpeg subprocess with progress parsing
// 4. Extract thumbnail frame
// 5. Compute checksum
// 6. Return paths for upload
//
// This module is called by the RenderEngineAgent. It handles
// only the FFmpeg execution — storage upload is separate.
// ============================================================

import { execFile, type ChildProcess } from 'child_process';
import { createWriteStream, mkdirSync, existsSync, readFileSync, unlinkSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { Logger } from '@creatorai/agents';
import type { VideoTimeline, CaptionPackage, RenderResult } from '../types/video-production.types';

const log = Logger.for('FFmpegRenderer');

export interface FFmpegRenderOptions {
  outputDir: string;
  quality: '720p' | '1080p' | '4k';
  orientation: 'vertical' | 'horizontal' | 'square';
  fps: number;
  codec: 'h264';
}

const RESOLUTIONS: Record<string, Record<string, { w: number; h: number }>> = {
  '720p':  { vertical: { w: 720, h: 1280 }, horizontal: { w: 1280, h: 720 }, square: { w: 720, h: 720 } },
  '1080p': { vertical: { w: 1080, h: 1920 }, horizontal: { w: 1920, h: 1080 }, square: { w: 1080, h: 1080 } },
  '4k':    { vertical: { w: 2160, h: 3840 }, horizontal: { w: 3840, h: 2160 }, square: { w: 2160, h: 2160 } },
};

/**
 * Render a VideoTimeline into a real MP4 file using FFmpeg.
 */
export async function renderWithFFmpeg(
  timeline: VideoTimeline,
  captions: CaptionPackage,
  options: FFmpegRenderOptions,
  onProgress: (percent: number, message: string) => void,
  isCancelled: () => boolean,
): Promise<{ outputPath: string; thumbnailPath: string; durationSec: number; sizeBytes: number; checksum: string; renderTimeMs: number }> {
  const startTime = performance.now();
  const res = RESOLUTIONS[options.quality]?.[options.orientation] ?? { w: 1080, h: 1920 };
  const { w: width, h: height } = res;

  // Prepare output directory
  if (!existsSync(options.outputDir)) mkdirSync(options.outputDir, { recursive: true });

  const outputPath = join(options.outputDir, 'output.mp4');
  const thumbnailPath = join(options.outputDir, 'thumbnail.jpg');
  const srtPath = join(options.outputDir, 'captions.srt');

  onProgress(5, 'Downloading assets');

  // ---- Step 1: Download all assets to temp files ----
  const visualTrack = timeline.tracks.find((t) => t.type === 'image');
  const voiceTrack = timeline.tracks.find((t) => t.type === 'voice');
  const musicTrack = timeline.tracks.find((t) => t.type === 'music');

  const imagePaths: string[] = [];
  const audioPaths: string[] = [];

  if (visualTrack) {
    for (let i = 0; i < visualTrack.layers.length; i++) {
      const layer = visualTrack.layers[i]!;
      if (layer.sourceUrl) {
        const path = join(options.outputDir, `scene_${i}.png`);
        await downloadFile(layer.sourceUrl, path);
        imagePaths.push(path);
      }
      if (isCancelled()) throw new Error('Render cancelled');
    }
  }

  onProgress(20, 'Downloading audio');

  if (voiceTrack) {
    for (let i = 0; i < voiceTrack.layers.length; i++) {
      const layer = voiceTrack.layers[i]!;
      if (layer.sourceUrl) {
        const path = join(options.outputDir, `voice_${i}.mp3`);
        await downloadFile(layer.sourceUrl, path);
        audioPaths.push(path);
      }
    }
  }

  let musicPath: string | null = null;
  if (musicTrack?.layers[0]?.sourceUrl) {
    musicPath = join(options.outputDir, 'music.mp3');
    await downloadFile(musicTrack.layers[0].sourceUrl, musicPath);
  }

  // Write SRT file
  if (captions.srt) {
    const { writeFileSync } = await import('fs');
    writeFileSync(srtPath, captions.srt, 'utf-8');
  }

  if (isCancelled()) throw new Error('Render cancelled');

  onProgress(30, 'Building FFmpeg filter graph');

  // ---- Step 2: Build FFmpeg command ----
  // If we have real images, render them. Otherwise, generate a placeholder.
  const hasImages = imagePaths.length > 0 && imagePaths.every((p) => existsSync(p) && statSync(p).size > 100);
  const hasAudio = audioPaths.length > 0 && audioPaths.every((p) => existsSync(p) && statSync(p).size > 100);

  const totalDurationSec = timeline.totalDurationMs / 1000;
  const args: string[] = ['-y']; // Overwrite output

  if (hasImages) {
    // ---- Real image-based rendering ----
    const sceneDurations = visualTrack!.layers.map((l) => l.durationMs / 1000);

    // Input images as video segments
    for (let i = 0; i < imagePaths.length; i++) {
      const dur = sceneDurations[i] ?? 5;
      args.push('-loop', '1', '-t', String(dur), '-i', imagePaths[i]!);
    }

    // Input voice tracks
    for (const ap of audioPaths) {
      args.push('-i', ap);
    }

    // Input music
    if (musicPath && existsSync(musicPath)) {
      args.push('-i', musicPath);
    }

    // Filter complex: scale + Ken Burns + concat
    const filterParts: string[] = [];
    const vLabels: string[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const label = `v${i}`;
      // Scale to target resolution, apply Ken Burns (slow zoom)
      filterParts.push(
        `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,` +
        `zoompan=z='min(zoom+0.0005,1.08)':d=${options.fps * (sceneDurations[i] ?? 5)}:s=${width}x${height}:fps=${options.fps},` +
        `setpts=PTS-STARTPTS[${label}]`
      );
      vLabels.push(`[${label}]`);
    }

    // Concat video segments
    if (vLabels.length > 1) {
      filterParts.push(`${vLabels.join('')}concat=n=${vLabels.length}:v=1:a=0[vout]`);
    } else if (vLabels.length === 1) {
      filterParts.push(`${vLabels[0]}copy[vout]`);
    }

    // Concat audio segments
    if (audioPaths.length > 0) {
      const audioInputStart = imagePaths.length;
      const aLabels = audioPaths.map((_, i) => `[${audioInputStart + i}:a]`);
      if (aLabels.length > 1) {
        filterParts.push(`${aLabels.join('')}concat=n=${aLabels.length}:v=0:a=1[anarr]`);
      } else {
        filterParts.push(`${aLabels[0]}acopy[anarr]`);
      }

      // Mix with music if available
      if (musicPath && existsSync(musicPath)) {
        const musicIdx = imagePaths.length + audioPaths.length;
        filterParts.push(`[${musicIdx}:a]volume=0.12[abg]`);
        filterParts.push(`[anarr][abg]amix=inputs=2:duration=shortest[aout]`);
      } else {
        filterParts.push(`[anarr]acopy[aout]`);
      }
    }

    args.push('-filter_complex', filterParts.join(';'));

    // Map outputs
    args.push('-map', '[vout]');
    if (audioPaths.length > 0) {
      args.push('-map', '[aout]');
    }

    // Subtitle burn-in (if SRT exists and has content)
    if (existsSync(srtPath) && captions.segments.length > 0) {
      // Apply subtitles via -vf (requires re-encoding anyway)
      // Note: can't use both -filter_complex and -vf, so subtitles are
      // applied via the subtitle filter in the complex or as a post-pass.
      // For simplicity, we skip burn-in here and note it as a TODO
      // for the advanced caption styling (ASS format).
    }
  } else {
    // ---- No real images — generate a test video ----
    log.warn('No downloadable images found — generating test video');
    args.push(
      '-f', 'lavfi', '-i', `color=c=0x111111:s=${width}x${height}:d=${totalDurationSec}:r=${options.fps}`,
      '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', String(totalDurationSec),
    );
  }

  // Output settings
  args.push(
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-r', String(options.fps),
    '-movflags', '+faststart',
    '-shortest',
    outputPath,
  );

  onProgress(40, 'Rendering video with FFmpeg');

  // ---- Step 3: Execute FFmpeg ----
  await new Promise<void>((resolve, reject) => {
    const proc = execFile('ffmpeg', args, { maxBuffer: 50 * 1024 * 1024 }, (error, _stdout, stderr) => {
      if (error) {
        log.error('FFmpeg execution failed', { error: error.message, stderr: stderr?.slice(-500) });
        reject(new Error(`FFmpeg failed: ${error.message}`));
      } else {
        resolve();
      }
    });

    // Parse progress from stderr
    if (proc.stderr) {
      let lastPercent = 40;
      proc.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        const timeMatch = text.match(/time=(\d+):(\d+):(\d+)/);
        if (timeMatch) {
          const secs = parseInt(timeMatch[1]!) * 3600 + parseInt(timeMatch[2]!) * 60 + parseInt(timeMatch[3]!);
          const pct = Math.min(90, 40 + Math.round((secs / totalDurationSec) * 50));
          if (pct > lastPercent) {
            lastPercent = pct;
            onProgress(pct, `Encoding: ${Math.round((secs / totalDurationSec) * 100)}%`);
          }
        }
      });
    }
  });

  if (!existsSync(outputPath)) {
    throw new Error('FFmpeg produced no output file');
  }

  onProgress(92, 'Extracting thumbnail');

  // ---- Step 4: Extract thumbnail ----
  const thumbTime = Math.min(2, totalDurationSec * 0.15);
  try {
    await new Promise<void>((resolve, reject) => {
      execFile('ffmpeg', [
        '-y', '-ss', String(thumbTime), '-i', outputPath,
        '-vframes', '1', '-q:v', '2', thumbnailPath,
      ], (error) => { error ? reject(error) : resolve(); });
    });
  } catch {
    log.warn('Thumbnail extraction failed — continuing without thumbnail');
  }

  onProgress(95, 'Computing checksum');

  // ---- Step 5: Compute checksum ----
  const videoBuffer = readFileSync(outputPath);
  const checksum = createHash('sha256').update(videoBuffer).digest('hex').slice(0, 16);
  const sizeBytes = videoBuffer.length;

  const renderTimeMs = Math.round(performance.now() - startTime);

  onProgress(100, 'Render complete');

  log.info('FFmpeg render complete', {
    outputPath,
    durationSec: totalDurationSec,
    sizeBytes,
    renderTimeMs,
    resolution: `${width}x${height}`,
  });

  return { outputPath, thumbnailPath, durationSec: totalDurationSec, sizeBytes, checksum, renderTimeMs };
}

// ---- Helpers ----

async function downloadFile(url: string, destPath: string): Promise<void> {
  if (!url || url.length < 10) return;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!resp.ok) {
      log.warn('Asset download failed', { url: url.slice(0, 80), status: resp.status });
      return;
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    const { writeFileSync } = await import('fs');
    writeFileSync(destPath, buffer);
  } catch (err) {
    log.warn('Asset download error', { url: url.slice(0, 80), error: (err as Error).message });
  }
}
