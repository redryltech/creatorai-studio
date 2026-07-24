// ============================================================
// CreatorAI Studio — Publishing & Distribution Domain Types
// ============================================================
import { z } from 'zod';
// ---- Publish Request ----
export const PublishRequestSchema = z.object({
    videoUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    platform: z.enum(['youtube', 'instagram', 'tiktok', 'facebook', 'linkedin', 'x']),
    accountId: z.string().min(1),
    seo: z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(10000),
        tags: z.array(z.string()).max(50).default([]),
        hashtags: z.array(z.string()).max(30).default([]),
    }),
    visibility: z.enum(['public', 'unlisted', 'private', 'draft']).default('public'),
    scheduleAt: z.string().datetime().optional(),
    options: z.record(z.unknown()).optional(),
});
//# sourceMappingURL=publishing.types.js.map