// ============================================================
// CreatorAI Studio — Timeline Builder
// ============================================================
// Assembles a VideoTimeline from media assets.
// Each scene becomes a set of synchronized layers:
//   image/video + voiceover + subtitle + transition + effect
//
// The timeline is a data structure — it does NOT render anything.
// The Render Engine reads the timeline to produce the final MP4.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { ScriptPackage } from '../../types/automation.types';
import type { ImagePackage, VideoClipPackage, VoicePackage, MusicPackage } from '../../media/types/media.types';
import type { VideoTimeline, TimelineTrack, TimelineLayer, Transition, VideoEffect } from '../types/video-production.types';
import type { ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { IAutomationAgent } from '../../interfaces/automation-agent.interface';

const log = Logger.for('TimelineBuilder');

interface TimelineInput {
  request: Record<string, unknown>;
  scriptPackage: ScriptPackage;
  images: ImagePackage[];
  videoClips: VideoClipPackage[];
  voiceovers: VoicePackage[];
  music: MusicPackage | null;
  transitions: Transition[];
  effects: VideoEffect[];
  resolution?: { width: number; height: number };
  fps?: number;
}

export class TimelineBuilderAgent implements IAutomationAgent<TimelineInput, VideoTimeline> {
  readonly agentId = 'automation.timeline_builder';
  readonly agentName = 'Timeline Builder';
  readonly stage = 'timeline';

  validate(input: TimelineInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.scriptPackage?.scenes?.length) errors.push('ScriptPackage with scenes required');
    if (!input.images?.length && !input.videoClips?.length) errors.push('Images or video clips required');
    if (!input.voiceovers?.length) errors.push('Voiceovers required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Timeline assembly: no cost (CPU only)'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'Timeline builder is CPU-only, always healthy' };
  }

  async execute(
    input: TimelineInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<VideoTimeline> {
    const { scriptPackage, images, videoClips, voiceovers, music, transitions, effects } = input;
    const resolution = input.resolution ?? { width: 1080, height: 1920 };
    const fps = input.fps ?? 30;

    log.info('Building timeline', { scenes: scriptPackage.scenes.length, images: images.length, voiceovers: voiceovers.length });
    onProgress(10, 'Calculating scene timings');

    // Calculate scene timings from voiceover durations
    let currentTimeMs = 0;
    const sceneTimes: Array<{ sceneId: string; startMs: number; endMs: number; durationMs: number }> = [];

    for (const scene of scriptPackage.scenes) {
      const vo = voiceovers.find((v) => v.sceneId === scene.id);
      const durationMs = Math.round((vo?.duration ?? scene.duration ?? 5) * 1000);
      sceneTimes.push({ sceneId: scene.id, startMs: currentTimeMs, endMs: currentTimeMs + durationMs, durationMs });
      currentTimeMs += durationMs;
    }

    const totalDurationMs = currentTimeMs;
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Building visual track');

    // ---- Image/Video Track ----
    const visualTrack: TimelineTrack = {
      id: generateId(ID_PREFIXES.step), type: 'image', label: 'Visual',
      layers: sceneTimes.map((st) => {
        const clip = videoClips.find((v) => v.sceneId === st.sceneId);
        const img = images.find((im) => im.sceneId === st.sceneId);
        const sourceUrl = clip?.videoUrl ?? img?.imageUrl ?? '';
        return {
          id: generateId(ID_PREFIXES.step), type: clip ? 'video' as const : 'image' as const,
          startTimeMs: st.startMs, endTimeMs: st.endMs, durationMs: st.durationMs,
          sourceUrl, sourceType: clip ? 'video' as const : 'image' as const,
          properties: { sceneId: st.sceneId, width: resolution.width, height: resolution.height },
        };
      }),
      muted: true, volume: 0, locked: false,
    };

    onProgress(45, 'Building voice track');

    // ---- Voice Track ----
    const voiceTrack: TimelineTrack = {
      id: generateId(ID_PREFIXES.step), type: 'voice', label: 'Voiceover',
      layers: sceneTimes.map((st) => {
        const vo = voiceovers.find((v) => v.sceneId === st.sceneId);
        return {
          id: generateId(ID_PREFIXES.step), type: 'voice',
          startTimeMs: st.startMs, endTimeMs: st.endMs, durationMs: st.durationMs,
          sourceUrl: vo?.audioUrl ?? '', sourceType: 'audio' as const,
          properties: { sceneId: st.sceneId, speaker: vo?.speaker, speed: vo?.speed },
        };
      }),
      muted: false, volume: 1.0, locked: false,
    };

    onProgress(60, 'Building music track');

    // ---- Music Track ----
    const musicTrack: TimelineTrack = {
      id: generateId(ID_PREFIXES.step), type: 'music', label: 'Background Music',
      layers: music ? [{
        id: generateId(ID_PREFIXES.step), type: 'music',
        startTimeMs: 0, endTimeMs: totalDurationMs, durationMs: totalDurationMs,
        sourceUrl: music.audioUrl, sourceType: 'audio' as const,
        properties: { genre: music.genre, mood: music.mood, tempo: music.tempo, volume: 0.15 },
      }] : [],
      muted: !music, volume: 0.15, locked: false,
    };

    onProgress(70, 'Building transition track');

    // ---- Transition Track ----
    const transitionTrack: TimelineTrack = {
      id: generateId(ID_PREFIXES.step), type: 'transition', label: 'Transitions',
      layers: transitions.map((t) => {
        const toScene = sceneTimes.find((st) => st.sceneId === t.toSceneId);
        const startMs = toScene ? toScene.startMs - t.durationMs / 2 : 0;
        return {
          id: generateId(ID_PREFIXES.step), type: 'transition',
          startTimeMs: Math.max(0, startMs), endTimeMs: startMs + t.durationMs,
          durationMs: t.durationMs, sourceUrl: '', sourceType: 'effect' as const,
          properties: { transitionType: t.type, easing: t.easing, ...t.parameters },
        };
      }),
      muted: true, volume: 0, locked: false,
    };

    onProgress(80, 'Building effects track');

    // ---- Effects Track ----
    const effectsTrack: TimelineTrack = {
      id: generateId(ID_PREFIXES.step), type: 'animation', label: 'Effects',
      layers: effects.map((e) => ({
        id: generateId(ID_PREFIXES.step), type: 'animation',
        startTimeMs: e.startMs, endTimeMs: e.endMs, durationMs: e.endMs - e.startMs,
        sourceUrl: '', sourceType: 'effect' as const,
        properties: { effectType: e.type, intensity: e.intensity, ...e.parameters },
      })),
      muted: true, volume: 0, locked: false,
    };

    const timeline: VideoTimeline = {
      id: generateId(ID_PREFIXES.step),
      projectId: (input.request as Record<string, string>).projectId ?? '',
      totalDurationMs,
      tracks: [visualTrack, voiceTrack, musicTrack, transitionTrack, effectsTrack],
      resolution, fps,
      aspectRatio: resolution.width < resolution.height ? '9:16' : resolution.width === resolution.height ? '1:1' : '16:9',
      metadata: {
        sceneCount: scriptPackage.scenes.length,
        hasSubtitles: false,
        hasMusic: !!music,
        hasTransitions: transitions.length > 0,
        createdAt: new Date(),
      },
    };

    onProgress(100, 'Timeline built');
    log.info('Timeline built', { totalDurationMs, trackCount: timeline.tracks.length, sceneCount: scriptPackage.scenes.length });
    return timeline;
  }
}
