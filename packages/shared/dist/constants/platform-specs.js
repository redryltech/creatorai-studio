// ============================================================
// CreatorAI Studio — Platform Specifications
// ============================================================
// Authoritative reference for each platform's content limits
// and requirements. Used by SEO agent, editor agent, and
// publishing agent to ensure compliance.
// ============================================================
import { Platform } from '../types/enums';
export const PLATFORM_SPECS = {
    [Platform.YOUTUBE]: {
        id: Platform.YOUTUBE,
        name: 'YouTube',
        video: {
            minDuration: 1,
            maxDuration: 43200, // 12 hours
            maxFileSize: 256 * 1024 * 1024 * 1024, // 256 GB
            supportedFormats: ['mp4', 'mov', 'avi', 'wmv', 'webm'],
            aspectRatios: ['16:9', '4:3', '1:1'],
            maxResolution: { width: 3840, height: 2160 },
        },
        text: {
            titleMaxLength: 100,
            descriptionMaxLength: 5000,
            maxTags: 500, // 500 chars total
            maxTagLength: 30,
            maxHashtags: 15,
        },
        thumbnail: {
            width: 1280,
            height: 720,
            maxFileSize: 2 * 1024 * 1024, // 2 MB
            formats: ['jpg', 'png', 'gif', 'bmp'],
        },
    },
    [Platform.YOUTUBE_SHORTS]: {
        id: Platform.YOUTUBE_SHORTS,
        name: 'YouTube Shorts',
        video: {
            minDuration: 1,
            maxDuration: 180, // 3 minutes (updated 2024)
            maxFileSize: 256 * 1024 * 1024 * 1024,
            supportedFormats: ['mp4', 'mov', 'webm'],
            aspectRatios: ['9:16'],
            maxResolution: { width: 1080, height: 1920 },
        },
        text: {
            titleMaxLength: 100,
            descriptionMaxLength: 5000,
            maxTags: 500,
            maxTagLength: 30,
            maxHashtags: 15,
        },
        thumbnail: {
            width: 1080,
            height: 1920,
            maxFileSize: 2 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.INSTAGRAM]: {
        id: Platform.INSTAGRAM,
        name: 'Instagram',
        video: {
            minDuration: 3,
            maxDuration: 60,
            maxFileSize: 100 * 1024 * 1024, // 100 MB
            supportedFormats: ['mp4', 'mov'],
            aspectRatios: ['1:1', '4:5', '16:9'],
            maxResolution: { width: 1920, height: 1080 },
        },
        text: {
            titleMaxLength: 0, // No title on Instagram
            descriptionMaxLength: 2200,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 30,
        },
        thumbnail: {
            width: 1080,
            height: 1080,
            maxFileSize: 8 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.INSTAGRAM_REELS]: {
        id: Platform.INSTAGRAM_REELS,
        name: 'Instagram Reels',
        video: {
            minDuration: 3,
            maxDuration: 90,
            maxFileSize: 100 * 1024 * 1024,
            supportedFormats: ['mp4', 'mov'],
            aspectRatios: ['9:16'],
            maxResolution: { width: 1080, height: 1920 },
        },
        text: {
            titleMaxLength: 0,
            descriptionMaxLength: 2200,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 30,
        },
        thumbnail: {
            width: 1080,
            height: 1920,
            maxFileSize: 8 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.FACEBOOK]: {
        id: Platform.FACEBOOK,
        name: 'Facebook',
        video: {
            minDuration: 1,
            maxDuration: 14400, // 4 hours
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10 GB
            supportedFormats: ['mp4', 'mov'],
            aspectRatios: ['16:9', '9:16', '1:1', '4:5'],
            maxResolution: { width: 1920, height: 1080 },
        },
        text: {
            titleMaxLength: 255,
            descriptionMaxLength: 63206,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 30,
        },
        thumbnail: {
            width: 1200,
            height: 630,
            maxFileSize: 8 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.TIKTOK]: {
        id: Platform.TIKTOK,
        name: 'TikTok',
        video: {
            minDuration: 3,
            maxDuration: 600, // 10 minutes
            maxFileSize: 4 * 1024 * 1024 * 1024, // 4 GB
            supportedFormats: ['mp4', 'mov', 'webm'],
            aspectRatios: ['9:16'],
            maxResolution: { width: 1080, height: 1920 },
        },
        text: {
            titleMaxLength: 0,
            descriptionMaxLength: 2200,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 100, // TikTok supports many
        },
        thumbnail: {
            width: 1080,
            height: 1920,
            maxFileSize: 8 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.LINKEDIN]: {
        id: Platform.LINKEDIN,
        name: 'LinkedIn',
        video: {
            minDuration: 3,
            maxDuration: 600, // 10 minutes
            maxFileSize: 5 * 1024 * 1024 * 1024, // 5 GB
            supportedFormats: ['mp4'],
            aspectRatios: ['16:9', '1:1', '9:16'],
            maxResolution: { width: 1920, height: 1080 },
        },
        text: {
            titleMaxLength: 150,
            descriptionMaxLength: 3000,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 5,
        },
        thumbnail: {
            width: 1200,
            height: 627,
            maxFileSize: 8 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.X]: {
        id: Platform.X,
        name: 'X (Twitter)',
        video: {
            minDuration: 1,
            maxDuration: 140,
            maxFileSize: 512 * 1024 * 1024, // 512 MB
            supportedFormats: ['mp4', 'mov'],
            aspectRatios: ['16:9', '1:1'],
            maxResolution: { width: 1920, height: 1080 },
        },
        text: {
            titleMaxLength: 0,
            descriptionMaxLength: 280,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 3,
        },
        thumbnail: {
            width: 1200,
            height: 675,
            maxFileSize: 5 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
    [Platform.PINTEREST]: {
        id: Platform.PINTEREST,
        name: 'Pinterest',
        video: {
            minDuration: 4,
            maxDuration: 900, // 15 minutes
            maxFileSize: 2 * 1024 * 1024 * 1024,
            supportedFormats: ['mp4', 'mov'],
            aspectRatios: ['9:16', '2:3', '1:1'],
            maxResolution: { width: 1080, height: 1920 },
        },
        text: {
            titleMaxLength: 100,
            descriptionMaxLength: 500,
            maxTags: 0,
            maxTagLength: 0,
            maxHashtags: 20,
        },
        thumbnail: {
            width: 1000,
            height: 1500,
            maxFileSize: 10 * 1024 * 1024,
            formats: ['jpg', 'png'],
        },
    },
};
//# sourceMappingURL=platform-specs.js.map