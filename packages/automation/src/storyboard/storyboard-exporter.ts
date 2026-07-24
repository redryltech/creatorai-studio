// ============================================================
// CreatorAI Studio — Storyboard Exporter
// ============================================================
// Exports the Storyboard into multiple consumption formats.
// ============================================================

import type { Storyboard, StoryboardExportPackage } from './storyboard.types';

export class StoryboardExporter {
  /**
   * Export the storyboard into all consumption formats.
   */
  static export(storyboard: Storyboard, directorCategory?: string, directorPacing?: string): StoryboardExportPackage {
    return {
      storyboardJson: storyboard,

      timelineJson: {
        totalDuration: storyboard.metadata.totalDuration,
        frames: storyboard.frames.map((f) => ({
          id: f.frameId,
          start: f.timing.startTimeSec,
          end: f.timing.endTimeSec,
          duration: f.timing.durationSec,
          transition: `${f.timing.animationCurve}`,
        })),
      },

      promptPackage: {
        imagePrompts: storyboard.frames.map((f) => ({
          sceneId: f.sceneId,
          prompt: f.prompts.imagePrompt,
          negative: f.prompts.negativePrompt,
        })),
        videoPrompts: storyboard.frames.map((f) => ({
          sceneId: f.sceneId,
          prompt: f.prompts.videoPrompt,
          negative: f.prompts.negativePrompt,
        })),
        thumbnailPrompts: storyboard.frames
          .filter((f) => f.thumbnailCandidate)
          .map((f) => ({
            sceneId: f.sceneId,
            prompt: f.prompts.thumbnailPrompt,
          })),
      },

      directorPackage: {
        planId: storyboard.directorPlanId,
        category: directorCategory ?? 'cinematic',
        style: storyboard.globalStyle.artStyle,
        colorGrading: storyboard.globalContinuity.colorGrading,
        pacing: directorPacing ?? 'dynamic',
      },

      previewPackage: {
        frames: storyboard.frames.map((f) => ({
          id: f.frameId,
          order: f.sceneOrder,
          description: f.frameDescription.slice(0, 120),
          duration: f.expectedDuration,
          camera: `${f.camera.position} / ${f.camera.lens}`,
          lighting: f.style.lightingSummary.slice(0, 60),
          mood: f.style.mood,
          thumbnail: f.thumbnailCandidate,
        })),
      },
    };
  }
}
