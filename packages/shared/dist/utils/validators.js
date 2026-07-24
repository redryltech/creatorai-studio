// ============================================================
// CreatorAI Studio — Zod Validation Schemas
// ============================================================
// Centralized validation schemas used by both API endpoints
// and frontend forms. Single source of truth for validation.
// ============================================================
import { z } from 'zod';
import { ContentType, Platform, AspectRatio, ArtStyle, ScriptStyle, } from '../types/enums';
// ---- Helpers ----
const enumValues = (e) => Object.values(e);
// ---- Chat ----
export const chatMessageSchema = z.object({
    conversationId: z.string().nullable(),
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(4000, 'Message too long (max 4000 characters)'),
    attachments: z
        .array(z.object({
        type: z.string(),
        url: z.string().url(),
        name: z.string(),
    }))
        .optional()
        .default([]),
    projectId: z.string().optional(),
});
// ---- Projects ----
export const createProjectSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title too long (max 200 characters)'),
    description: z.string().max(2000).optional().default(''),
    contentType: z.nativeEnum(ContentType),
    targetPlatforms: z
        .array(z.nativeEnum(Platform))
        .min(1, 'At least one platform is required')
        .max(8),
    settings: z
        .object({
        aspectRatio: z.nativeEnum(AspectRatio).optional(),
        duration: z.number().positive().max(43200).optional(),
        language: z.string().min(2).max(10).optional().default('en'),
        voiceId: z.string().optional(),
        musicStyle: z.string().optional(),
        artStyle: z.nativeEnum(ArtStyle).optional(),
        subtitles: z.boolean().optional().default(true),
    })
        .optional(),
});
export const updateProjectSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    settings: z
        .object({
        aspectRatio: z.nativeEnum(AspectRatio).optional(),
        duration: z.number().positive().max(43200).optional(),
        language: z.string().min(2).max(10).optional(),
        voiceId: z.string().nullable().optional(),
        musicStyle: z.string().nullable().optional(),
        artStyle: z.nativeEnum(ArtStyle).nullable().optional(),
        subtitles: z.boolean().optional(),
    })
        .optional(),
});
// ---- Agent Inputs ----
export const trendResearchSchema = z.object({
    topic: z.string().min(1).max(500),
    platforms: z.array(z.nativeEnum(Platform)).min(1).default([Platform.YOUTUBE]),
    count: z.number().int().positive().max(20).default(5),
    timeRange: z.enum(['24h', '7d', '30d']).default('7d'),
    language: z.string().min(2).max(10).default('en'),
    niche: z.string().max(200).optional(),
});
export const scriptGenerateSchema = z.object({
    topic: z.string().min(1).max(1000),
    contentType: z.nativeEnum(ContentType),
    targetPlatform: z.nativeEnum(Platform),
    duration: z.number().positive().max(3600).optional(),
    style: z.nativeEnum(ScriptStyle).default(ScriptStyle.HOOK_STORY_CTA),
    tone: z
        .enum(['professional', 'casual', 'dramatic', 'humorous', 'inspirational', 'informative'])
        .default('professional'),
    language: z.string().min(2).max(10).default('en'),
    hook: z.string().max(500).optional(),
    keyPoints: z.array(z.string().max(500)).max(10).optional(),
    brandVoice: z.string().max(2000).optional(),
});
export const imageGenerateSchema = z.object({
    prompt: z.string().min(1).max(4000),
    negativePrompt: z.string().max(2000).optional().default(''),
    width: z.number().int().min(256).max(4096).optional().default(1024),
    height: z.number().int().min(256).max(4096).optional().default(1024),
    provider: z.string().optional(),
    model: z.string().optional(),
    count: z.number().int().min(1).max(4).optional().default(1),
});
export const videoGenerateSchema = z.object({
    mode: z.enum(['text_to_video', 'image_to_video']),
    prompt: z.string().min(1).max(2000),
    imageUrl: z.string().url().optional(),
    duration: z.number().positive().max(30).optional().default(5),
    provider: z.string().optional(),
});
export const voiceGenerateSchema = z.object({
    text: z.string().min(1).max(10000),
    voiceId: z.string().optional(),
    provider: z.string().optional(),
    language: z.string().min(2).max(10).default('en'),
    speed: z.number().min(0.5).max(2.0).default(1.0),
    emotion: z.string().optional(),
});
export const thumbnailGenerateSchema = z.object({
    topic: z.string().min(1).max(500),
    style: z.string().optional().default('youtube_thumbnail'),
    includeText: z.boolean().optional().default(true),
    textOverlay: z.string().max(100).optional(),
    count: z.number().int().min(1).max(4).optional().default(3),
});
export const seoGenerateSchema = z.object({
    topic: z.string().min(1).max(1000),
    platform: z.nativeEnum(Platform),
    script: z.string().max(50000).optional(),
    language: z.string().min(2).max(10).default('en'),
    count: z.number().int().min(1).max(5).default(3),
});
export const composeVideoSchema = z.object({
    projectId: z.string().min(1),
    format: z
        .object({
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        fps: z.number().int().min(24).max(60).optional().default(30),
        codec: z.enum(['h264', 'h265', 'vp9']).optional().default('h264'),
    })
        .optional(),
    subtitles: z
        .object({
        enabled: z.boolean().default(true),
        style: z.string().optional().default('bold_center'),
        fontSize: z.number().int().min(12).max(120).optional().default(48),
        color: z.string().optional().default('#FFFFFF'),
        strokeColor: z.string().optional().default('#000000'),
    })
        .optional(),
    music: z
        .object({
        style: z.string().optional(),
        volume: z.number().min(0).max(1).optional().default(0.15),
    })
        .optional(),
    transitions: z
        .object({
        type: z.string().optional().default('crossfade'),
        duration: z.number().min(0).max(3).optional().default(0.5),
    })
        .optional(),
});
// ---- Publishing ----
export const publishSchema = z.object({
    outputId: z.string().min(1),
    platform: z.nativeEnum(Platform),
    overrides: z
        .object({
        title: z.string().max(200).optional(),
        description: z.string().max(10000).optional(),
        tags: z.array(z.string().max(100)).max(50).optional(),
        hashtags: z.array(z.string().max(100)).max(30).optional(),
    })
        .optional(),
});
export const schedulePublishSchema = publishSchema.extend({
    scheduledAt: z.string().datetime({ message: 'Must be a valid ISO 8601 date' }),
});
// ---- Pagination ----
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().max(200).optional(),
});
//# sourceMappingURL=validators.js.map