// ============================================================
// CreatorAI Studio — Project Types
// ============================================================

import {
  ContentType,
  Platform,
  ProjectStatus,
  AspectRatio,
  ArtStyle,
  SceneType,
  TransitionType,
  AssetType,
  PublishStatus,
} from './enums';

/**
 * Project settings — configurable per project.
 */
export interface ProjectSettings {
  aspectRatio: AspectRatio;
  duration: number; // Target duration in seconds
  language: string; // BCP-47 language tag
  voiceId: string | null;
  musicStyle: string | null;
  artStyle: ArtStyle | null;
  subtitles: boolean;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
}

/**
 * Core project document — stored in Firestore `projects/{projectId}`.
 */
export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  contentType: ContentType;
  targetPlatforms: Platform[];
  originalPrompt: string;
  settings: ProjectSettings;
  pipelineId: string | null;
  script: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Scene within a project — stored in `projects/{id}/scenes/{sceneId}`.
 */
export interface Scene {
  id: string;
  projectId: string;
  order: number;
  type: SceneType;
  scriptText: string;
  visualDescription: string;
  directorNotes: string;
  voiceoverUrl: string | null;
  voiceoverDuration: number | null;
  imagePrompt: string | null;
  imageNegativePrompt: string | null;
  imageUrl: string | null;
  videoPrompt: string | null;
  videoUrl: string | null;
  duration: number; // seconds
  transition: TransitionType;
  kenBurns: KenBurnsEffect | null;
  createdAt: Date;
}

/**
 * Ken Burns effect configuration — pan/zoom on static images.
 */
export interface KenBurnsEffect {
  startScale: number; // e.g., 1.0
  endScale: number; // e.g., 1.2
  startPosition: { x: number; y: number }; // 0-1 normalized
  endPosition: { x: number; y: number };
}

/**
 * Media asset — stored in `projects/{id}/assets/{assetId}`.
 */
export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  purpose: string; // e.g., "scene-1-background", "voiceover-scene-3"
  url: string;
  storageRef: string; // Firebase Storage path
  metadata: AssetMetadata;
  createdAt: Date;
}

/**
 * Asset file metadata.
 */
export interface AssetMetadata {
  width: number | null;
  height: number | null;
  duration: number | null; // seconds, for audio/video
  format: string; // file extension
  sizeBytes: number;
  mimeType: string;
}

/**
 * Project output — platform-specific deliverable.
 * Stored in `projects/{id}/outputs/{outputId}`.
 */
export interface ProjectOutput {
  id: string;
  projectId: string;
  platform: Platform;
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  publishStatus: PublishStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  platformPostId: string | null;
  platformUrl: string | null;
  createdAt: Date;
}

/**
 * Default project settings per platform.
 * These are applied when a user doesn't specify custom settings.
 */
export const DEFAULT_PLATFORM_SETTINGS: Record<
  Platform,
  Pick<ProjectSettings, 'aspectRatio' | 'duration' | 'fps' | 'resolution'>
> = {
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
