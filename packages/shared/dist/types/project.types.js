// ============================================================
// CreatorAI Studio — Project Types
// ============================================================
import { Platform, AspectRatio, } from './enums';
/**
 * Default project settings per platform.
 * These are applied when a user doesn't specify custom settings.
 */
export const DEFAULT_PLATFORM_SETTINGS = {
    [Platform.YOUTUBE]: {
        aspectRatio: AspectRatio.LANDSCAPE,
        duration: 600, // 10 minutes
        fps: 30,
        resolution: { width: 1920, height: 1080 },
    },
    [Platform.YOUTUBE_SHORTS]: {
        aspectRatio: AspectRatio.PORTRAIT,
        duration: 60,
        fps: 30,
        resolution: { width: 1080, height: 1920 },
    },
    [Platform.INSTAGRAM]: {
        aspectRatio: AspectRatio.SQUARE,
        duration: 60,
        fps: 30,
        resolution: { width: 1080, height: 1080 },
    },
    [Platform.INSTAGRAM_REELS]: {
        aspectRatio: AspectRatio.PORTRAIT,
        duration: 90,
        fps: 30,
        resolution: { width: 1080, height: 1920 },
    },
    [Platform.FACEBOOK]: {
        aspectRatio: AspectRatio.LANDSCAPE,
        duration: 120,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
    },
    [Platform.TIKTOK]: {
        aspectRatio: AspectRatio.PORTRAIT,
        duration: 60,
        fps: 30,
        resolution: { width: 1080, height: 1920 },
    },
    [Platform.LINKEDIN]: {
        aspectRatio: AspectRatio.LANDSCAPE,
        duration: 120,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
    },
    [Platform.X]: {
        aspectRatio: AspectRatio.LANDSCAPE,
        duration: 140,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
    },
    [Platform.PINTEREST]: {
        aspectRatio: AspectRatio.PORTRAIT,
        duration: 60,
        fps: 30,
        resolution: { width: 1080, height: 1920 },
    },
};
//# sourceMappingURL=project.types.js.map