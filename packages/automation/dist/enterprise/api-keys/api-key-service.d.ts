import type { ApiKey, WebhookConfig } from '../types/enterprise.types';
export declare class ApiKeyService {
    private static instance;
    private keys;
    private webhooks;
    private constructor();
    static getInstance(): ApiKeyService;
    static resetInstance(): void;
    /** Create an API key. Returns the raw key ONCE (never stored). */
    createKey(params: {
        userId: string;
        organizationId: string;
        name: string;
        permissions?: string[];
        rateLimit?: number;
    }): {
        apiKey: ApiKey;
        rawKey: string;
    };
    /** Verify a raw key and return the ApiKey if valid. */
    verifyKey(rawKey: string): ApiKey | null;
    /** Revoke an API key. */
    revokeKey(keyId: string): boolean;
    /** List keys for organization. */
    listKeys(organizationId: string): Omit<ApiKey, 'keyHash'>[];
    /** Register a webhook. */
    registerWebhook(params: {
        userId: string;
        organizationId: string;
        url: string;
        events: string[];
    }): WebhookConfig;
    /** Get webhooks for organization. */
    getWebhooks(organizationId: string): WebhookConfig[];
}
//# sourceMappingURL=api-key-service.d.ts.map