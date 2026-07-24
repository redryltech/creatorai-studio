// ============================================================
// CreatorAI Studio — Mock Voice Provider (Development Mode)
// ============================================================
// Generates silent audio files with correct duration when
// no voice API key is configured. Uses FFmpeg to create
// real MP3 files with a sine tone (so the rendered video
// has audible content for testing).
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { IMediaProvider, ProviderResponse } from '../types/media.types';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const log = Logger.for('MockVoiceProvider');

export class MockVoiceProvider implements IMediaProvider {
  readonly providerId = 'mock_voice';
  readonly providerName = 'Mock Voice (Dev Mode)';
  readonly mediaType = 'voice' as const;
  readonly priority = 99;

  async isAvailable(): Promise<boolean> { return true; }
  estimateCost(): number { return 0; }
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> { return { healthy: true, latencyMs: 0 }; }

  async generate(request: Record<string, unknown>): Promise<ProviderResponse> {
    const text = (request.text as string) ?? '';
    if (!text || text.length < 2) throw new Error('Text required');

    // Estimate duration: ~150 words per minute
    const wordCount = text.split(/\s+/).length;
    const durationSec = Math.max(2, Math.round((wordCount / 150) * 60));

    const outDir = join(tmpdir(), 'creatorai-mock-voice');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const filePath = join(outDir, `${generateId(ID_PREFIXES.asset)}.mp3`);

    try {
      // Generate a real MP3 with a gentle sine tone
      const { execSync } = await import('child_process');
      execSync(`ffmpeg -y -f lavfi -i "sine=frequency=220:duration=${durationSec}" -c:a libmp3lame -b:a 64k "${filePath}" 2>/dev/null`, { timeout: 10000 });
    } catch {
      // Fallback: write minimal silent MP3 frame
      const silentFrame = Buffer.alloc(417); // Minimal MP3 frame
      silentFrame[0] = 0xFF; silentFrame[1] = 0xFB; silentFrame[2] = 0x90;
      const { writeFileSync } = require('fs');
      writeFileSync(filePath, silentFrame);
    }

    let buffer: Buffer | null = null;
    try { buffer = readFileSync(filePath); } catch { /* ok */ }

    log.info('Mock voice generated', { textLength: text.length, wordCount, durationSec, filePath });

    return {
      success: true,
      url: `file://${filePath}`,
      buffer,
      duration: durationSec,
      metadata: {
        mockGenerated: true,
        textLength: text.length,
        wordCount,
        speaker: (request.voiceId as string) ?? 'mock',
        language: (request.language as string) ?? 'en',
        format: 'mp3',
      },
      costUsd: 0,
      provider: this.providerId,
      model: 'mock-tts',
      error: null,
    };
  }
}
