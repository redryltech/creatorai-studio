// ============================================================
// CreatorAI Studio — Instagram Publisher (Real Graph API)
// ============================================================
// Implements IPublisher for real Instagram Reels and video
// posts using the Instagram Graph API (Meta Graph API).
//
// Publishing flow (Instagram Content Publishing API):
//   1. POST /{ig-user-id}/media — Create media container
//   2. Poll container status until FINISHED
//   3. POST /{ig-user-id}/media_publish — Publish container
//   4. GET /{media-id} — Retrieve permalink
//
// Requirements:
//   - Instagram Business or Creator account
//   - Facebook App with instagram_content_publish permission
//   - Long-lived access token
// ============================================================

import { Logger, CostTracker } from '@creatorai/agents';
import type { IPublisher, SocialAccount, PublishRequest, PublishResult, PublisherHealth, SocialPlatformId } from '../types/publishing.types';

const log = Logger.for('InstagramPublisher');

const GRAPH_BASE = 'https://graph.facebook.com';
const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 5000;

export interface InstagramPublisherConfig {
  appId: string;
  appSecret: string;
  graphVersion: string;
}

export class InstagramPublisher implements IPublisher {
  readonly platformId: SocialPlatformId = 'instagram';
  readonly platformName = 'Instagram';

  private config: InstagramPublisherConfig | null = null;

  /** Set Meta App config. Called during bootstrap. */
  configure(config: InstagramPublisherConfig): void {
    this.config = config;
    log.info('Instagram publisher configured', { appId: config.appId.slice(0, 8) + '...', version: config.graphVersion });
  }

  private get graphUrl(): string {
    return `${GRAPH_BASE}/${this.config?.graphVersion ?? 'v23.0'}`;
  }

  // ================================================================
  // Authentication
  // ================================================================

  async authenticate(account: SocialAccount): Promise<boolean> {
    try {
      const resp = await fetch(`${this.graphUrl}/${account.accountId}?fields=id,username&access_token=${account.accessToken}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) return false;
      const data = (await resp.json()) as { id?: string };
      return !!data.id;
    } catch {
      return false;
    }
  }

  async refreshAuth(account: SocialAccount): Promise<SocialAccount> {
    if (!this.config) throw new Error('Instagram publisher not configured');

    log.info('Refreshing Instagram access token');

    // Exchange for long-lived token
    const resp = await fetch(
      `${this.graphUrl}/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${this.config.appId}` +
      `&client_secret=${this.config.appSecret}` +
      `&fb_exchange_token=${account.accessToken}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Token refresh failed: ${resp.status} ${errText}`);
    }

    const data = (await resp.json()) as { access_token: string; expires_in?: number };

    return {
      ...account,
      accessToken: data.access_token,
      tokenExpiresAt: new Date(Date.now() + (data.expires_in ?? 5184000) * 1000), // ~60 days
    };
  }

  // ================================================================
  // Validation
  // ================================================================

  validate(request: PublishRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!request.videoUrl) errors.push('Video URL required');
    if (request.seo.description && request.seo.description.length > 2200) errors.push('Caption must be ≤2200 characters');
    if (request.seo.hashtags && request.seo.hashtags.length > 30) errors.push('Maximum 30 hashtags');

    // Video must be accessible via public URL for Instagram
    if (request.videoUrl && !request.videoUrl.startsWith('http')) {
      errors.push('Instagram requires a publicly accessible video URL (https://)');
    }

    return { valid: errors.length === 0, errors };
  }

  // ================================================================
  // Upload (Real Instagram Graph API)
  // ================================================================

  async upload(
    request: PublishRequest,
    account: SocialAccount,
    onProgress: (progress: number, message: string) => void,
  ): Promise<PublishResult> {
    const startTime = performance.now();
    const igUserId = account.accountId; // Instagram Business Account ID

    log.info('Instagram publish starting', { accountId: igUserId, captionLength: request.seo.description?.length ?? 0 });
    onProgress(5, 'Validating publish request');

    // ---- Validate ----
    const validation = this.validate(request);
    if (!validation.valid) throw new Error(`Validation: ${validation.errors.join(', ')}`);

    // ---- Ensure authenticated ----
    onProgress(8, 'Checking authentication');
    let currentAccount = account;
    if (!(await this.authenticate(currentAccount))) {
      onProgress(10, 'Refreshing access token');
      currentAccount = await this.refreshAuth(currentAccount);
    }

    // ---- Build caption ----
    const caption = this.buildCaption(request);

    // ---- Step 1: Create media container ----
    onProgress(15, 'Creating Instagram media container');

    const containerParams = new URLSearchParams({
      media_type: 'REELS',
      video_url: request.videoUrl,
      caption,
      access_token: currentAccount.accessToken,
    });

    // Add cover image if provided
    if (request.thumbnailUrl) {
      containerParams.set('cover_url', request.thumbnailUrl);
    }

    // Add share to feed
    containerParams.set('share_to_feed', 'true');

    const containerResp = await fetch(`${this.graphUrl}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams,
      signal: AbortSignal.timeout(30000),
    });

    if (!containerResp.ok) {
      const errBody = await containerResp.text();
      throw new Error(`Container creation failed: ${containerResp.status} ${errBody}`);
    }

    const containerData = (await containerResp.json()) as { id: string };
    const containerId = containerData.id;

    if (!containerId) throw new Error('No container ID returned');

    log.info('Container created', { containerId });
    onProgress(25, `Container created: ${containerId}`);

    // ---- Step 2: Poll container status ----
    onProgress(30, 'Waiting for Instagram to process video');

    let containerStatus = 'IN_PROGRESS';
    let statusCheckError: string | null = null;

    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      try {
        const statusResp = await fetch(
          `${this.graphUrl}/${containerId}?fields=status_code,status&access_token=${currentAccount.accessToken}`,
          { signal: AbortSignal.timeout(10000) },
        );

        if (!statusResp.ok) continue;

        const statusData = (await statusResp.json()) as { status_code?: string; status?: string };
        containerStatus = statusData.status_code ?? statusData.status ?? 'IN_PROGRESS';

        if (containerStatus === 'FINISHED') {
          log.info('Container processing complete', { containerId });
          break;
        }

        if (containerStatus === 'ERROR') {
          statusCheckError = 'Container processing failed';
          break;
        }

        // Report progress
        const progress = 30 + Math.min(40, Math.round((i / MAX_POLL_ATTEMPTS) * 40));
        onProgress(progress, `Processing: ${containerStatus} (${i + 1}/${MAX_POLL_ATTEMPTS})`);
      } catch {
        // Continue polling
      }
    }

    if (containerStatus !== 'FINISHED') {
      throw new Error(`Container processing failed: ${containerStatus}. ${statusCheckError ?? 'Timed out'}`);
    }

    onProgress(75, 'Publishing to Instagram');

    // ---- Step 3: Publish the container ----
    const publishResp = await fetch(`${this.graphUrl}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: currentAccount.accessToken,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!publishResp.ok) {
      const errBody = await publishResp.text();
      throw new Error(`Publishing failed: ${publishResp.status} ${errBody}`);
    }

    const publishData = (await publishResp.json()) as { id: string };
    const mediaId = publishData.id;

    if (!mediaId) throw new Error('No media ID returned after publishing');

    log.info('Media published', { mediaId });
    onProgress(90, 'Retrieving permalink');

    // ---- Step 4: Get permalink ----
    let permalink = `https://www.instagram.com/reel/${mediaId}/`;
    let thumbnailUrl: string | null = null;

    try {
      const mediaResp = await fetch(
        `${this.graphUrl}/${mediaId}?fields=permalink,thumbnail_url,timestamp,media_type&access_token=${currentAccount.accessToken}`,
        { signal: AbortSignal.timeout(10000) },
      );

      if (mediaResp.ok) {
        const mediaData = (await mediaResp.json()) as { permalink?: string; thumbnail_url?: string };
        permalink = mediaData.permalink ?? permalink;
        thumbnailUrl = mediaData.thumbnail_url ?? null;
      }
    } catch {
      log.warn('Could not retrieve permalink (using estimated URL)');
    }

    const uploadDurationMs = Math.round(performance.now() - startTime);

    CostTracker.getInstance().record('publish.instagram', 0, 'usd', { mediaId });

    onProgress(100, `Published to Instagram: ${mediaId}`);

    log.info('Instagram publish complete', {
      mediaId,
      permalink,
      uploadDurationMs,
      containerId,
    });

    return {
      platformPostId: mediaId,
      platformUrl: permalink,
      platform: 'instagram',
      thumbnailUrl,
      publishedAt: new Date(),
      visibility: request.visibility,
      metadata: {
        mediaId,
        containerId,
        permalink,
        uploadDurationMs,
        accountId: igUserId,
        mediaType: 'REELS',
      },
    };
  }

  // ================================================================
  // Schedule, Delete, Update, Status
  // ================================================================

  async schedule(request: PublishRequest, account: SocialAccount, scheduleAt: Date): Promise<PublishResult> {
    // Instagram API supports scheduled publishing for some account types
    // For now, we upload and the scheduling is handled by the ContentCalendar
    log.info('Instagram scheduling (via calendar)', { scheduledAt: scheduleAt.toISOString() });
    return this.upload(request, account, () => {});
  }

  async delete(platformPostId: string, account: SocialAccount): Promise<boolean> {
    log.info('Deleting Instagram media', { mediaId: platformPostId });
    const resp = await fetch(`${this.graphUrl}/${platformPostId}?access_token=${account.accessToken}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(10000),
    });
    return resp.ok;
  }

  async update(platformPostId: string, updates: Partial<PublishRequest['seo']>, account: SocialAccount): Promise<boolean> {
    // Instagram Graph API has limited update support (caption only for some media types)
    log.info('Instagram media update', { mediaId: platformPostId });
    if (updates.description) {
      const resp = await fetch(`${this.graphUrl}/${platformPostId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          caption: updates.description,
          access_token: account.accessToken,
        }),
        signal: AbortSignal.timeout(10000),
      });
      return resp.ok;
    }
    return true;
  }

  async getStatus(platformPostId: string, account: SocialAccount): Promise<{ status: string; url: string }> {
    try {
      const resp = await fetch(
        `${this.graphUrl}/${platformPostId}?fields=permalink,media_type&access_token=${account.accessToken}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!resp.ok) return { status: 'unknown', url: `https://instagram.com/reel/${platformPostId}` };
      const data = (await resp.json()) as { permalink?: string; media_type?: string };
      return { status: 'published', url: data.permalink ?? `https://instagram.com/reel/${platformPostId}` };
    } catch {
      return { status: 'unknown', url: `https://instagram.com/reel/${platformPostId}` };
    }
  }

  async healthCheck(account: SocialAccount): Promise<PublisherHealth> {
    const start = performance.now();
    const authenticated = await this.authenticate(account);
    return {
      platform: 'instagram',
      healthy: authenticated,
      authenticated,
      rateLimitRemaining: null,
      latencyMs: Math.round(performance.now() - start),
      lastError: authenticated ? null : 'Authentication failed',
      lastPublishAt: null,
    };
  }

  // ================================================================
  // Private
  // ================================================================

  private buildCaption(request: PublishRequest): string {
    const parts: string[] = [];

    if (request.seo.description) {
      parts.push(request.seo.description);
    }

    if (request.seo.hashtags?.length) {
      parts.push('');
      parts.push(request.seo.hashtags.map((h) => h.startsWith('#') ? h : `#${h}`).join(' '));
    }

    return parts.join('\n').slice(0, 2200);
  }
}
