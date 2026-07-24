// ============================================================
// CreatorAI Studio — Instagram Publisher Integration Tests
// ============================================================
// Verifies real Instagram Graph API integration.
//
// REQUIRES:
//   INSTAGRAM_ACCESS_TOKEN (long-lived token)
//   INSTAGRAM_BUSINESS_ACCOUNT_ID (IG user ID)
//   INSTAGRAM_APP_ID
//   INSTAGRAM_APP_SECRET
//
// Skips automatically if credentials are missing.
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Logger, LogLevel, CostTracker } from '@creatorai/agents';
import { InstagramPublisher } from '../publishing/providers/instagram.publisher';
import { PublisherRegistry } from '../publishing/registry/publisher-registry';
import type { SocialAccount } from '../publishing/types/publishing.types';

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN ?? '';
const ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? '';
const APP_ID = process.env.INSTAGRAM_APP_ID ?? '';
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? '';
const SKIP = !ACCESS_TOKEN || !ACCOUNT_ID;

const describeIf = SKIP ? describe.skip : describe;

describeIf('Instagram Publisher Integration — Real API Calls', () => {
  let publisher: InstagramPublisher;
  let account: SocialAccount;

  beforeAll(() => {
    Logger.configure({ level: LogLevel.WARN });

    publisher = new InstagramPublisher();
    if (APP_ID && APP_SECRET) {
      publisher.configure({ appId: APP_ID, appSecret: APP_SECRET, graphVersion: 'v23.0' });
    }

    PublisherRegistry.getInstance().register(publisher);

    account = {
      id: 'ig-test',
      userId: 'test-user',
      platform: 'instagram',
      accountName: 'Test Account',
      accountId: ACCOUNT_ID,
      accessToken: ACCESS_TOKEN,
      refreshToken: '',
      tokenExpiresAt: new Date(Date.now() + 86400000),
      scopes: ['instagram_content_publish'],
      isActive: true,
      connectedAt: new Date(),
    };
  });

  afterAll(() => {
    PublisherRegistry.resetInstance();
    CostTracker.resetInstance();
  });

  // ---- Authentication ----

  it('authenticates with valid token', async () => {
    const authenticated = await publisher.authenticate(account);
    expect(authenticated).toBe(true);
  }, 15000);

  // ---- Validation ----

  it('validates a correct request', () => {
    const result = publisher.validate({
      videoUrl: 'https://example.com/video.mp4',
      platform: 'instagram',
      accountId: ACCOUNT_ID,
      seo: { title: '', description: 'Test caption #test', tags: [], hashtags: ['#test'] },
      visibility: 'public',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects local file paths', () => {
    const result = publisher.validate({
      videoUrl: '/tmp/local.mp4',
      platform: 'instagram',
      accountId: ACCOUNT_ID,
      seo: { title: '', description: '', tags: [], hashtags: [] },
      visibility: 'public',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('publicly accessible'))).toBe(true);
  });

  it('rejects caption > 2200 chars', () => {
    const result = publisher.validate({
      videoUrl: 'https://example.com/video.mp4',
      platform: 'instagram',
      accountId: ACCOUNT_ID,
      seo: { title: '', description: 'A'.repeat(2201), tags: [], hashtags: [] },
      visibility: 'public',
    });
    expect(result.valid).toBe(false);
  });

  it('rejects > 30 hashtags', () => {
    const result = publisher.validate({
      videoUrl: 'https://example.com/video.mp4',
      platform: 'instagram',
      accountId: ACCOUNT_ID,
      seo: { title: '', description: '', tags: [], hashtags: Array.from({ length: 31 }, (_, i) => `#tag${i}`) },
      visibility: 'public',
    });
    expect(result.valid).toBe(false);
  });

  // ---- Health Check ----

  it('passes health check', async () => {
    const health = await publisher.healthCheck(account);
    expect(health.platform).toBe('instagram');
    expect(health.healthy).toBe(true);
    expect(health.authenticated).toBe(true);
    expect(health.latencyMs).toBeGreaterThan(0);
  }, 15000);

  // ---- Registry ----

  it('is discoverable through PublisherRegistry', () => {
    const found = PublisherRegistry.getInstance().get('instagram');
    expect(found).toBeDefined();
    expect(found!.platformId).toBe('instagram');
    expect(found!.platformName).toBe('Instagram');
  });

  // ---- Real Upload (requires a publicly hosted video URL) ----
  // This test is commented out by default because it requires
  // a real publicly accessible video URL and will post to IG.
  //
  // it('publishes a real Reel to Instagram', async () => {
  //   const result = await publisher.upload({
  //     videoUrl: 'https://your-storage.com/test-video.mp4',
  //     platform: 'instagram',
  //     accountId: ACCOUNT_ID,
  //     seo: {
  //       title: '',
  //       description: 'Test post from CreatorAI Studio 🚀 #test #creatorai',
  //       tags: [],
  //       hashtags: ['#test', '#creatorai'],
  //     },
  //     visibility: 'public',
  //   }, account, (pct, msg) => console.log(`  ${pct}% ${msg}`));
  //
  //   expect(result.platformPostId).toBeTruthy();
  //   expect(result.platformUrl).toContain('instagram.com');
  //   console.log(`✅ Instagram Reel published: ${result.platformUrl}`);
  // }, 300000);
});
