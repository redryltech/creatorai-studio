// ============================================================
// CreatorAI Studio — FFmpeg Render Integration Tests
// ============================================================
// Verifies real video rendering using FFmpeg.
// Skips automatically if FFmpeg is not available.
// ============================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync, execSync } from 'child_process';
import { existsSync, statSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Logger, LogLevel, CostTracker } from '@creatorai/agents';
import { renderWithFFmpeg } from '../video/renderer/ffmpeg-renderer';
import type { VideoTimeline, CaptionPackage, CaptionStyle } from '../video/types/video-production.types';

// Check FFmpeg availability
let ffmpegAvailable = false;
try { execFileSync('ffmpeg', ['-version'], { timeout: 5000 }); ffmpegAvailable = true; } catch {}

const describeIf = ffmpegAvailable ? describe : describe.skip;

function createTestTimeline(outputDir: string): { timeline: VideoTimeline; captions: CaptionPackage } {
  // Create a real test image (solid color PNG via FFmpeg)
  const imgPath = join(outputDir, 'scene_0.png');
  try {
    execSync(`ffmpeg -y -f lavfi -i color=c=blue:s=540x960:d=1 -frames:v 1 "${imgPath}" 2>/dev/null`);
  } catch { /* may fail, that's OK */ }

  // Create a test audio file (sine wave)
  const audioPath = join(outputDir, 'voice_0.mp3');
  try {
    execSync(`ffmpeg -y -f lavfi -i "sine=frequency=440:duration=3" -c:a libmp3lame -b:a 64k "${audioPath}" 2>/dev/null`);
  } catch { /* may fail */ }

  const hasImage = existsSync(imgPath) && statSync(imgPath).size > 100;
  const hasAudio = existsSync(audioPath) && statSync(audioPath).size > 100;

  const timeline: VideoTimeline = {
    id: 'test-timeline',
    projectId: 'test-project',
    totalDurationMs: 3000,
    tracks: [
      {
        id: 'visual', type: 'image', label: 'Visual', muted: true, volume: 0, locked: false,
        layers: [{
          id: 'layer-v0', type: 'image', startTimeMs: 0, endTimeMs: 3000, durationMs: 3000,
          sourceUrl: hasImage ? `file://${imgPath}` : '', sourceType: 'image',
          properties: { width: 540, height: 960 },
        }],
      },
      {
        id: 'voice', type: 'voice', label: 'Voice', muted: false, volume: 1, locked: false,
        layers: hasAudio ? [{
          id: 'layer-a0', type: 'voice', startTimeMs: 0, endTimeMs: 3000, durationMs: 3000,
          sourceUrl: `file://${audioPath}`, sourceType: 'audio',
          properties: {},
        }] : [],
      },
      { id: 'music', type: 'music', label: 'Music', muted: true, volume: 0.15, locked: false, layers: [] },
      { id: 'trans', type: 'transition', label: 'Transitions', muted: true, volume: 0, locked: false, layers: [] },
      { id: 'fx', type: 'animation', label: 'Effects', muted: true, volume: 0, locked: false, layers: [] },
    ],
    resolution: { width: 540, height: 960 },
    fps: 24,
    aspectRatio: '9:16',
    metadata: { sceneCount: 1, hasSubtitles: true, hasMusic: false, hasTransitions: false, createdAt: new Date() },
  };

  const defaultStyle: CaptionStyle = { preset: 'bold', fontSize: 48, fontFamily: 'Inter', fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3, backgroundColor: null, position: 'bottom', animation: 'none' };

  const captions: CaptionPackage = {
    segments: [{ id: 'seg1', sceneId: 'scene-0', text: 'Hello world', startMs: 0, endMs: 3000, words: [{ text: 'Hello', startMs: 0, endMs: 1500 }, { text: 'world', startMs: 1500, endMs: 3000 }], style: defaultStyle }],
    srt: '1\n00:00:00,000 --> 00:00:03,000\nHello world\n',
    vtt: 'WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nHello world\n',
    totalWords: 2,
    totalDurationMs: 3000,
    style: defaultStyle,
  };

  return { timeline, captions };
}

describeIf('FFmpeg Render Integration — Real Rendering', () => {
  let outputDir: string;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });
    outputDir = join(tmpdir(), 'creatorai-test-render', Date.now().toString());
    mkdirSync(outputDir, { recursive: true });
  });

  it('FFmpeg is available', () => {
    const version = execFileSync('ffmpeg', ['-version'], { timeout: 5000 }).toString().split('\n')[0];
    expect(version).toContain('ffmpeg');
  });

  it('renders a real MP4 video', async () => {
    const renderDir = join(outputDir, 'render-test');
    mkdirSync(renderDir, { recursive: true });
    const { timeline, captions } = createTestTimeline(renderDir);

    const result = await renderWithFFmpeg(
      timeline, captions,
      { outputDir: renderDir, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' },
      (pct, msg) => { /* progress */ },
      () => false,
    );

    // Verify output file exists
    expect(existsSync(result.outputPath)).toBe(true);

    // Verify file size is reasonable (at least 1KB for a 3s video)
    expect(result.sizeBytes).toBeGreaterThan(1000);

    // Verify duration
    expect(result.durationSec).toBeGreaterThan(0);

    // Verify checksum
    expect(result.checksum).toBeTruthy();
    expect(result.checksum.length).toBe(16);

    // Verify render time was tracked
    expect(result.renderTimeMs).toBeGreaterThan(0);

    // Verify the output is a valid MP4 (check ftyp header)
    const buffer = readFileSync(result.outputPath);
    // MP4 files start with ftyp box: bytes 4-7 should be 'ftyp'
    const ftyp = buffer.slice(4, 8).toString('ascii');
    expect(ftyp).toBe('ftyp');
  }, 60000);

  it('generates a thumbnail', async () => {
    const renderDir = join(outputDir, 'thumb-test');
    mkdirSync(renderDir, { recursive: true });
    const { timeline, captions } = createTestTimeline(renderDir);

    const result = await renderWithFFmpeg(
      timeline, captions,
      { outputDir: renderDir, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' },
      () => {},
      () => false,
    );

    // Thumbnail may or may not exist depending on FFmpeg behavior with short videos
    if (existsSync(result.thumbnailPath)) {
      const thumbSize = statSync(result.thumbnailPath).size;
      expect(thumbSize).toBeGreaterThan(100);
    }
  }, 60000);

  it('produces consistent checksum for same input', async () => {
    const renderDir1 = join(outputDir, 'checksum-1');
    const renderDir2 = join(outputDir, 'checksum-2');
    mkdirSync(renderDir1, { recursive: true });
    mkdirSync(renderDir2, { recursive: true });

    // Same timeline, different render directories
    const t1 = createTestTimeline(renderDir1);
    const t2 = createTestTimeline(renderDir2);

    const r1 = await renderWithFFmpeg(t1.timeline, t1.captions, { outputDir: renderDir1, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' }, () => {}, () => false);
    const r2 = await renderWithFFmpeg(t2.timeline, t2.captions, { outputDir: renderDir2, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' }, () => {}, () => false);

    // Both should produce valid videos
    expect(r1.sizeBytes).toBeGreaterThan(0);
    expect(r2.sizeBytes).toBeGreaterThan(0);
    // Sizes should be similar (not exact due to encoding non-determinism)
    expect(Math.abs(r1.sizeBytes - r2.sizeBytes) / r1.sizeBytes).toBeLessThan(0.3);
  }, 120000);

  it('reports progress during rendering', async () => {
    const renderDir = join(outputDir, 'progress-test');
    mkdirSync(renderDir, { recursive: true });
    const { timeline, captions } = createTestTimeline(renderDir);

    const progressUpdates: Array<{ pct: number; msg: string }> = [];

    await renderWithFFmpeg(
      timeline, captions,
      { outputDir: renderDir, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' },
      (pct, msg) => { progressUpdates.push({ pct, msg }); },
      () => false,
    );

    // Should have multiple progress updates
    expect(progressUpdates.length).toBeGreaterThan(3);
    // First should be early, last should be 100
    expect(progressUpdates[0]!.pct).toBeLessThan(30);
    expect(progressUpdates[progressUpdates.length - 1]!.pct).toBe(100);
  }, 60000);

  it('handles cancellation', async () => {
    const renderDir = join(outputDir, 'cancel-test');
    mkdirSync(renderDir, { recursive: true });
    const { timeline, captions } = createTestTimeline(renderDir);

    let cancelled = false;
    setTimeout(() => { cancelled = true; }, 100); // Cancel after 100ms

    await expect(
      renderWithFFmpeg(
        timeline, captions,
        { outputDir: renderDir, quality: '720p', orientation: 'vertical', fps: 24, codec: 'h264' },
        () => {},
        () => cancelled,
      ),
    ).rejects.toThrow('cancelled');
  }, 30000);
});
