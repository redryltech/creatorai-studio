// ============================================================
// CreatorAI Studio — YouTube Publisher Integration Tests
// ============================================================
// Verifies real YouTube Data API v3 integration.
//
// REQUIRES:
//   YOUTUBE_CLIENT_ID
//   YOUTUBE_CLIENT_SECRET
//   YOUTUBE_REFRESH_TOKEN
//
// Skips automatically if credentials are missing.
// Tests upload a real video to YouTube (as unlisted/private).
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { Logger, LogLevel, CostTracker } from '@creatorai/agents';
import { YouTubePublisher } from '../publishing/providers/youtube.publisher';
import { PublisherRegistry } from '../publishing/registry/publisher-registry';
import type { SocialAccount, PublishRequest } from '../publishing/types/publishing.types';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? '';
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN ?? '';
const SKIP = !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN;

const describeIf = SKIP ? describe.skip : describe;

describeIf('YouTube Publisher Integration — Real API Calls', () => {
  let publisher: YouTubePublisher;
  let testAccount: SocialAccount;
  let testVideoPath: string;
  let uploadedVideoId: string | null = null;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });

    publisher = new YouTubePublisher();
    publisher.configure({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: 'http://localhost:3001/api/v1/auth/youtube/callback',
    });

    PublisherRegistry.getInstance().register(publisher);

    testAccount = {
      id: 'test-account',
      userId: 'test-user',
      platform: 'youtube',
      accountName: 'Test Channel',
      accountId: '',
      accessToken: '', // Will be set after refresh
      refreshToken: REFRESH_TOKEN,
      tokenExpiresAt: new Date(0), // Expired — forces refresh
      scopes: ['https://www.googleapis.com/auth/youtube.upload'],
      isActive: true,
      connectedAt: new Date(),
    };

    // Create a minimal test video using FFmpeg
    const testDir = join(tmpdir(), 'creatorai-yt-test');
    mkdirSync(testDir, { recursive: true });
    testVideoPath = join(testDir, 'test.mp4');

    try {
      execSync(`ffmpeg -y -f lavfi -i "color=c=0x4263eb:s=1080x1920:d=3:r=24" -f lavfi -i "sine=frequency=440:duration=3" -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 64k -shortest "${testVideoPath}" 2>/dev/null`);
    } catch {
      // FFmpeg might not be available in all test environments
    }
  });

  afterAll(async () => {
    // Clean up: delete the test video from YouTube
    if (uploadedVideoId && testAccount.accessToken) {
      try {
        await publisher.delete(uploadedVideoId, testAccount);
      } catch { /* best effort */ }
    }

    PublisherRegistry.resetInstance();
    CostTracker.resetInstance();
  });

  // ---- OAuth ----

  it('refreshes OAuth token', async () => {
    const refreshed = await publisher.refreshAuth(testAccount);

    expect(refreshed.accessToken).toBeTruthy();
    expect(refreshed.accessToken.length).toBeGreaterThan(20);
    expect(refreshed.tokenExpiresAt.getTime()).toBeGreaterThan(Date.now());

    // Save for subsequent tests
    testAccount = refreshed;
  }, 15000);

  it('authenticates with refreshed token', async () => {
    if (!testAccount.accessToken) return;
    const authenticated = await publisher.authenticate(testAccount);
    expect(authenticated).toBe(true);
  }, 15000);

  // ---- Validation ----

  it('validates request correctly', () => {
    const valid = publisher.validate({
      videoUrl: '/tmp/test.mp4',
      platform: 'youtube',
      accountId: 'test',
      seo: { title: 'Test Video', description: 'Test', tags: ['test'], hashtags: [] },
      visibility: 'private',
    });
    expect(valid.valid).toBe(true);
  });

  it('rejects missing title', () => {
    const result = publisher.validate({
      videoUrl: '/tmp/test.mp4',
      platform: 'youtube',
      accountId: 'test',
      seo: { title: '', description: '', tags: [], hashtags: [] },
      visibility: 'public',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects title > 100 chars', () => {
    const result = publisher.validate({
      videoUrl: '/tmp/test.mp4',
      platform: 'youtube',
      accountId: 'test',
      seo: { title: 'A'.repeat(101), description: '', tags: [], hashtags: [] },
      visibility: 'public',
    });
    expect(result.valid).toBe(false);
  });

  // ---- Real Upload ----

  it('uploads a real video to YouTube (as private)', async () => {
    if (!testAccount.accessToken || !existsSync(testVideoPath)) {
      console.log('Skipping upload test: no token or no test video');
      return;
    }

    const progressUpdates: Array<{ pct: number; msg: string }> = [];

    const request: PublishRequest = {
      videoUrl: testVideoPath,
      platform: 'youtube',
      accountId: testAccount.id,
      seo: {
        title: `CreatorAI Test ${new Date().toISOString().slice(0, 16)}`,
        description: 'Automated test upload from CreatorAI Studio. This video will be deleted automatically.',
        tags: ['test', 'creatorai', 'automated'],
        hashtags: ['#test', '#creatorai'],
      },
      visibility: 'private', // Always private for tests
    };

    const result = await publisher.upload(request, testAccount, (pct, msg) => {
      progressUpdates.push({ pct, msg });
    });

    // Verify result
    expect(result.platformPostId).toBeTruthy();
    expect(result.platformUrl).toContain('youtube.com');
    expect(result.platform).toBe('youtube');
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.visibility).toBe('private');

    // Verify metadata
    const meta = result.metadata as Record<string, unknown>;
    expect(meta.videoId).toBeTruthy();
    expect(meta.url).toContain('youtube.com/watch?v=');
    expect(meta.uploadDurationMs).toBeGreaterThan(0);

    // Verify progress was reported
    expect(progressUpdates.length).toBeGreaterThan(3);

    // Save for cleanup
    uploadedVideoId = result.platformPostId;

    console.log(`✅ Real YouTube video uploaded: ${result.platformUrl}`);
  }, 120000);

  // ---- Status Check ----

  it('checks video status', async () => {
    if (!uploadedVideoId || !testAccount.accessToken) return;

    const status = await publisher.getStatus(uploadedVideoId, testAccount);
    expect(status.url).toContain(uploadedVideoId);
    expect(status.status).toBeTruthy();
  }, 15000);

  // ---- Health Check ----

  it('passes health check', async () => {
    if (!testAccount.accessToken) return;

    const health = await publisher.healthCheck(testAccount);
    expect(health.platform).toBe('youtube');
    expect(health.healthy).toBe(true);
    expect(health.authenticated).toBe(true);
    expect(health.latencyMs).toBeGreaterThan(0);
  }, 15000);

  // ---- Registry ----

  it('is discoverable through PublisherRegistry', () => {
    const found = PublisherRegistry.getInstance().get('youtube');
    expect(found).toBeDefined();
    expect(found!.platformId).toBe('youtube');
  });
});
