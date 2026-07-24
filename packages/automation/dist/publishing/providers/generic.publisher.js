// ============================================================
// CreatorAI Studio — Generic Publisher (Instagram, TikTok, Facebook, LinkedIn, X)
// ============================================================
// Base implementation for platforms that share similar upload patterns.
// Each platform overrides validate() and upload() specifics.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('GenericPublisher');
export class GenericPublisher {
    platformId;
    platformName;
    maxTitle;
    maxDescription;
    maxHashtags;
    constructor(config) {
        this.platformId = config.platformId;
        this.platformName = config.platformName;
        this.maxTitle = config.maxTitle;
        this.maxDescription = config.maxDescription;
        this.maxHashtags = config.maxHashtags;
    }
    async authenticate(account) {
        return !!account.accessToken && new Date() < account.tokenExpiresAt;
    }
    async refreshAuth(account) {
        log.info('Token refresh', { platform: this.platformId, accountId: account.id });
        return { ...account, tokenExpiresAt: new Date(Date.now() + 3600000) };
    }
    validate(request) {
        const errors = [];
        if (!request.videoUrl)
            errors.push('Video URL required');
        if (request.seo.title && request.seo.title.length > this.maxTitle)
            errors.push(`Title max ${this.maxTitle} chars`);
        if (request.seo.description && request.seo.description.length > this.maxDescription)
            errors.push(`Description max ${this.maxDescription} chars`);
        if (request.seo.hashtags && request.seo.hashtags.length > this.maxHashtags)
            errors.push(`Max ${this.maxHashtags} hashtags`);
        return { valid: errors.length === 0, errors };
    }
    async upload(request, account, onProgress) {
        log.info(`${this.platformName} upload starting`, { title: request.seo.title });
        onProgress(10, 'Validating');
        const v = this.validate(request);
        if (!v.valid)
            throw new Error(`Validation: ${v.errors.join(', ')}`);
        onProgress(30, `Uploading to ${this.platformName}`);
        // Platform-specific API calls would go here
        for (let p = 30; p <= 90; p += 15) {
            onProgress(p, `Uploading: ${p - 20}%`);
            await new Promise((r) => setTimeout(r, 80));
        }
        const postId = `${this.platformId}_${Date.now().toString(36)}`;
        const urlMap = {
            instagram: `https://instagram.com/reel/${postId}`,
            tiktok: `https://tiktok.com/@user/video/${postId}`,
            facebook: `https://facebook.com/watch/${postId}`,
            linkedin: `https://linkedin.com/feed/update/${postId}`,
            x: `https://x.com/user/status/${postId}`,
        };
        onProgress(100, `Published to ${this.platformName}`);
        return {
            platformPostId: postId,
            platformUrl: urlMap[this.platformId] ?? `https://${this.platformId}.com/${postId}`,
            platform: this.platformId,
            thumbnailUrl: request.thumbnailUrl ?? null,
            publishedAt: new Date(),
            visibility: request.visibility,
            metadata: { accountId: account.accountId },
        };
    }
    async schedule(request, account, scheduleAt) {
        return this.upload({ ...request, scheduleAt: scheduleAt.toISOString() }, account, () => { });
    }
    async delete(platformPostId, _account) {
        log.info(`${this.platformName} delete`, { postId: platformPostId });
        return true;
    }
    async update(platformPostId, updates, _account) {
        log.info(`${this.platformName} update`, { postId: platformPostId });
        return true;
    }
    async getStatus(platformPostId, _account) {
        return { status: 'published', url: `https://${this.platformId}.com/${platformPostId}` };
    }
    async healthCheck(account) {
        const authenticated = await this.authenticate(account);
        return {
            platform: this.platformId, healthy: authenticated, authenticated,
            rateLimitRemaining: null, latencyMs: 1,
            lastError: authenticated ? null : 'Not authenticated', lastPublishAt: null,
        };
    }
}
// ---- Pre-configured platform instances ----
// InstagramPublisher moved to instagram.publisher.ts (real Graph API)
export const TikTokPublisher = new GenericPublisher({ platformId: 'tiktok', platformName: 'TikTok', maxTitle: 0, maxDescription: 2200, maxHashtags: 100 });
export const FacebookPublisher = new GenericPublisher({ platformId: 'facebook', platformName: 'Facebook', maxTitle: 255, maxDescription: 63206, maxHashtags: 30 });
export const LinkedInPublisher = new GenericPublisher({ platformId: 'linkedin', platformName: 'LinkedIn', maxTitle: 150, maxDescription: 3000, maxHashtags: 5 });
export const XPublisher = new GenericPublisher({ platformId: 'x', platformName: 'X', maxTitle: 0, maxDescription: 280, maxHashtags: 3 });
//# sourceMappingURL=generic.publisher.js.map