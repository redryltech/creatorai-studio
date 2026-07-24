import { z } from 'zod';
import { ContentType, Platform, AspectRatio, ArtStyle, ScriptStyle } from '../types/enums';
export declare const chatMessageSchema: z.ZodObject<{
    conversationId: z.ZodNullable<z.ZodString>;
    message: z.ZodString;
    attachments: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        url: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        url: string;
        name: string;
    }, {
        type: string;
        url: string;
        name: string;
    }>, "many">>>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    conversationId: string | null;
    message: string;
    attachments: {
        type: string;
        url: string;
        name: string;
    }[];
    projectId?: string | undefined;
}, {
    conversationId: string | null;
    message: string;
    attachments?: {
        type: string;
        url: string;
        name: string;
    }[] | undefined;
    projectId?: string | undefined;
}>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    contentType: z.ZodNativeEnum<typeof ContentType>;
    targetPlatforms: z.ZodArray<z.ZodNativeEnum<typeof Platform>, "many">;
    settings: z.ZodOptional<z.ZodObject<{
        aspectRatio: z.ZodOptional<z.ZodNativeEnum<typeof AspectRatio>>;
        duration: z.ZodOptional<z.ZodNumber>;
        language: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        voiceId: z.ZodOptional<z.ZodString>;
        musicStyle: z.ZodOptional<z.ZodString>;
        artStyle: z.ZodOptional<z.ZodNativeEnum<typeof ArtStyle>>;
        subtitles: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        subtitles: boolean;
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        voiceId?: string | undefined;
        musicStyle?: string | undefined;
        artStyle?: ArtStyle | undefined;
    }, {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | undefined;
        musicStyle?: string | undefined;
        artStyle?: ArtStyle | undefined;
        subtitles?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    contentType: ContentType;
    targetPlatforms: Platform[];
    settings?: {
        language: string;
        subtitles: boolean;
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        voiceId?: string | undefined;
        musicStyle?: string | undefined;
        artStyle?: ArtStyle | undefined;
    } | undefined;
}, {
    title: string;
    contentType: ContentType;
    targetPlatforms: Platform[];
    description?: string | undefined;
    settings?: {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | undefined;
        musicStyle?: string | undefined;
        artStyle?: ArtStyle | undefined;
        subtitles?: boolean | undefined;
    } | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        aspectRatio: z.ZodOptional<z.ZodNativeEnum<typeof AspectRatio>>;
        duration: z.ZodOptional<z.ZodNumber>;
        language: z.ZodOptional<z.ZodString>;
        voiceId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        musicStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        artStyle: z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<typeof ArtStyle>>>;
        subtitles: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | null | undefined;
        musicStyle?: string | null | undefined;
        artStyle?: ArtStyle | null | undefined;
        subtitles?: boolean | undefined;
    }, {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | null | undefined;
        musicStyle?: string | null | undefined;
        artStyle?: ArtStyle | null | undefined;
        subtitles?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    settings?: {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | null | undefined;
        musicStyle?: string | null | undefined;
        artStyle?: ArtStyle | null | undefined;
        subtitles?: boolean | undefined;
    } | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    settings?: {
        aspectRatio?: AspectRatio | undefined;
        duration?: number | undefined;
        language?: string | undefined;
        voiceId?: string | null | undefined;
        musicStyle?: string | null | undefined;
        artStyle?: ArtStyle | null | undefined;
        subtitles?: boolean | undefined;
    } | undefined;
}>;
export declare const trendResearchSchema: z.ZodObject<{
    topic: z.ZodString;
    platforms: z.ZodDefault<z.ZodArray<z.ZodNativeEnum<typeof Platform>, "many">>;
    count: z.ZodDefault<z.ZodNumber>;
    timeRange: z.ZodDefault<z.ZodEnum<["24h", "7d", "30d"]>>;
    language: z.ZodDefault<z.ZodString>;
    niche: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: string;
    topic: string;
    platforms: Platform[];
    count: number;
    timeRange: "24h" | "7d" | "30d";
    niche?: string | undefined;
}, {
    topic: string;
    language?: string | undefined;
    platforms?: Platform[] | undefined;
    count?: number | undefined;
    timeRange?: "24h" | "7d" | "30d" | undefined;
    niche?: string | undefined;
}>;
export declare const scriptGenerateSchema: z.ZodObject<{
    topic: z.ZodString;
    contentType: z.ZodNativeEnum<typeof ContentType>;
    targetPlatform: z.ZodNativeEnum<typeof Platform>;
    duration: z.ZodOptional<z.ZodNumber>;
    style: z.ZodDefault<z.ZodNativeEnum<typeof ScriptStyle>>;
    tone: z.ZodDefault<z.ZodEnum<["professional", "casual", "dramatic", "humorous", "inspirational", "informative"]>>;
    language: z.ZodDefault<z.ZodString>;
    hook: z.ZodOptional<z.ZodString>;
    keyPoints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    brandVoice: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contentType: ContentType;
    language: string;
    topic: string;
    targetPlatform: Platform;
    style: ScriptStyle;
    tone: "professional" | "casual" | "dramatic" | "humorous" | "inspirational" | "informative";
    duration?: number | undefined;
    hook?: string | undefined;
    keyPoints?: string[] | undefined;
    brandVoice?: string | undefined;
}, {
    contentType: ContentType;
    topic: string;
    targetPlatform: Platform;
    duration?: number | undefined;
    language?: string | undefined;
    style?: ScriptStyle | undefined;
    tone?: "professional" | "casual" | "dramatic" | "humorous" | "inspirational" | "informative" | undefined;
    hook?: string | undefined;
    keyPoints?: string[] | undefined;
    brandVoice?: string | undefined;
}>;
export declare const imageGenerateSchema: z.ZodObject<{
    prompt: z.ZodString;
    negativePrompt: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    provider: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    count: number;
    prompt: string;
    negativePrompt: string;
    width: number;
    height: number;
    provider?: string | undefined;
    model?: string | undefined;
}, {
    prompt: string;
    count?: number | undefined;
    negativePrompt?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    provider?: string | undefined;
    model?: string | undefined;
}>;
export declare const videoGenerateSchema: z.ZodObject<{
    mode: z.ZodEnum<["text_to_video", "image_to_video"]>;
    prompt: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    provider: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration: number;
    prompt: string;
    mode: "text_to_video" | "image_to_video";
    provider?: string | undefined;
    imageUrl?: string | undefined;
}, {
    prompt: string;
    mode: "text_to_video" | "image_to_video";
    duration?: number | undefined;
    provider?: string | undefined;
    imageUrl?: string | undefined;
}>;
export declare const voiceGenerateSchema: z.ZodObject<{
    text: z.ZodString;
    voiceId: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    speed: z.ZodDefault<z.ZodNumber>;
    emotion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: string;
    text: string;
    speed: number;
    voiceId?: string | undefined;
    provider?: string | undefined;
    emotion?: string | undefined;
}, {
    text: string;
    language?: string | undefined;
    voiceId?: string | undefined;
    provider?: string | undefined;
    speed?: number | undefined;
    emotion?: string | undefined;
}>;
export declare const thumbnailGenerateSchema: z.ZodObject<{
    topic: z.ZodString;
    style: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    includeText: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    textOverlay: z.ZodOptional<z.ZodString>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    topic: string;
    count: number;
    style: string;
    includeText: boolean;
    textOverlay?: string | undefined;
}, {
    topic: string;
    count?: number | undefined;
    style?: string | undefined;
    includeText?: boolean | undefined;
    textOverlay?: string | undefined;
}>;
export declare const seoGenerateSchema: z.ZodObject<{
    topic: z.ZodString;
    platform: z.ZodNativeEnum<typeof Platform>;
    script: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    language: string;
    topic: string;
    count: number;
    platform: Platform;
    script?: string | undefined;
}, {
    topic: string;
    platform: Platform;
    language?: string | undefined;
    count?: number | undefined;
    script?: string | undefined;
}>;
export declare const composeVideoSchema: z.ZodObject<{
    projectId: z.ZodString;
    format: z.ZodOptional<z.ZodObject<{
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        fps: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        codec: z.ZodDefault<z.ZodOptional<z.ZodEnum<["h264", "h265", "vp9"]>>>;
    }, "strip", z.ZodTypeAny, {
        fps: number;
        codec: "h264" | "h265" | "vp9";
        width?: number | undefined;
        height?: number | undefined;
    }, {
        width?: number | undefined;
        height?: number | undefined;
        fps?: number | undefined;
        codec?: "h264" | "h265" | "vp9" | undefined;
    }>>;
    subtitles: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        style: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        fontSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        strokeColor: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        style: string;
        enabled: boolean;
        fontSize: number;
        color: string;
        strokeColor: string;
    }, {
        style?: string | undefined;
        enabled?: boolean | undefined;
        fontSize?: number | undefined;
        color?: string | undefined;
        strokeColor?: string | undefined;
    }>>;
    music: z.ZodOptional<z.ZodObject<{
        style: z.ZodOptional<z.ZodString>;
        volume: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        volume: number;
        style?: string | undefined;
    }, {
        style?: string | undefined;
        volume?: number | undefined;
    }>>;
    transitions: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        duration: number;
    }, {
        type?: string | undefined;
        duration?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    subtitles?: {
        style: string;
        enabled: boolean;
        fontSize: number;
        color: string;
        strokeColor: string;
    } | undefined;
    format?: {
        fps: number;
        codec: "h264" | "h265" | "vp9";
        width?: number | undefined;
        height?: number | undefined;
    } | undefined;
    music?: {
        volume: number;
        style?: string | undefined;
    } | undefined;
    transitions?: {
        type: string;
        duration: number;
    } | undefined;
}, {
    projectId: string;
    subtitles?: {
        style?: string | undefined;
        enabled?: boolean | undefined;
        fontSize?: number | undefined;
        color?: string | undefined;
        strokeColor?: string | undefined;
    } | undefined;
    format?: {
        width?: number | undefined;
        height?: number | undefined;
        fps?: number | undefined;
        codec?: "h264" | "h265" | "vp9" | undefined;
    } | undefined;
    music?: {
        style?: string | undefined;
        volume?: number | undefined;
    } | undefined;
    transitions?: {
        type?: string | undefined;
        duration?: number | undefined;
    } | undefined;
}>;
export declare const publishSchema: z.ZodObject<{
    outputId: z.ZodString;
    platform: z.ZodNativeEnum<typeof Platform>;
    overrides: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    platform: Platform;
    outputId: string;
    overrides?: {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    } | undefined;
}, {
    platform: Platform;
    outputId: string;
    overrides?: {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    } | undefined;
}>;
export declare const schedulePublishSchema: z.ZodObject<{
    outputId: z.ZodString;
    platform: z.ZodNativeEnum<typeof Platform>;
    overrides: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    }>>;
} & {
    scheduledAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    platform: Platform;
    outputId: string;
    scheduledAt: string;
    overrides?: {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    } | undefined;
}, {
    platform: Platform;
    outputId: string;
    scheduledAt: string;
    overrides?: {
        title?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        hashtags?: string[] | undefined;
    } | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type TrendResearchInput = z.infer<typeof trendResearchSchema>;
export type ScriptGenerateInput = z.infer<typeof scriptGenerateSchema>;
export type ImageGenerateInput = z.infer<typeof imageGenerateSchema>;
export type VideoGenerateInput = z.infer<typeof videoGenerateSchema>;
export type VoiceGenerateInput = z.infer<typeof voiceGenerateSchema>;
export type ThumbnailGenerateInput = z.infer<typeof thumbnailGenerateSchema>;
export type SeoGenerateInput = z.infer<typeof seoGenerateSchema>;
export type ComposeVideoInput = z.infer<typeof composeVideoSchema>;
export type PublishInput = z.infer<typeof publishSchema>;
export type SchedulePublishInput = z.infer<typeof schedulePublishSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
//# sourceMappingURL=validators.d.ts.map