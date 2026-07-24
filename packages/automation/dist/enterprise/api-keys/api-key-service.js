// ============================================================
// CreatorAI Studio — API Key Service
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { createHash, randomBytes } from 'crypto';
const log = Logger.for('ApiKeyService');
export class ApiKeyService {
    static instance = null;
    keys = [];
    webhooks = [];
    constructor() { }
    static getInstance() { if (!ApiKeyService.instance)
        ApiKeyService.instance = new ApiKeyService(); return ApiKeyService.instance; }
    static resetInstance() { ApiKeyService.instance = null; }
    /** Create an API key. Returns the raw key ONCE (never stored). */
    createKey(params) {
        const rawKey = `cai_${randomBytes(32).toString('hex')}`;
        const keyHash = createHash('sha256').update(rawKey).digest('hex');
        const key = {
            id: generateId(ID_PREFIXES.step), userId: params.userId, organizationId: params.organizationId,
            name: params.name, keyPrefix: rawKey.slice(0, 12), keyHash,
            permissions: params.permissions ?? ['read', 'write'], rateLimit: params.rateLimit ?? 60,
            lastUsedAt: null, expiresAt: null, createdAt: new Date(),
        };
        this.keys.push(key);
        log.info('API key created', { keyId: key.id, prefix: key.keyPrefix, name: params.name });
        return { apiKey: key, rawKey };
    }
    /** Verify a raw key and return the ApiKey if valid. */
    verifyKey(rawKey) {
        const hash = createHash('sha256').update(rawKey).digest('hex');
        const key = this.keys.find((k) => k.keyHash === hash);
        if (!key)
            return null;
        if (key.expiresAt && new Date() > key.expiresAt)
            return null;
        key.lastUsedAt = new Date();
        return key;
    }
    /** Revoke an API key. */
    revokeKey(keyId) {
        const idx = this.keys.findIndex((k) => k.id === keyId);
        if (idx === -1)
            return false;
        this.keys.splice(idx, 1);
        log.info('API key revoked', { keyId });
        return true;
    }
    /** List keys for organization. */
    listKeys(organizationId) {
        return this.keys.filter((k) => k.organizationId === organizationId).map(({ keyHash, ...rest }) => rest);
    }
    /** Register a webhook. */
    registerWebhook(params) {
        const webhook = {
            id: generateId(ID_PREFIXES.step), userId: params.userId, organizationId: params.organizationId,
            url: params.url, events: params.events, secret: randomBytes(32).toString('hex'),
            isActive: true, lastDeliveredAt: null, failureCount: 0, createdAt: new Date(),
        };
        this.webhooks.push(webhook);
        log.info('Webhook registered', { webhookId: webhook.id, url: params.url });
        return webhook;
    }
    /** Get webhooks for organization. */
    getWebhooks(organizationId) {
        return this.webhooks.filter((w) => w.organizationId === organizationId);
    }
}
//# sourceMappingURL=api-key-service.js.map