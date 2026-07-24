// ============================================================
// CreatorAI Studio — Video Effect Engine
// ============================================================
// Assigns visual effects to scenes based on content type,
// camera suggestions, and emotion.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { VoicePackage } from '../../media/types/media.types';
import type { VideoEffect, EffectType } from '../types/video-production.types';

const log = Logger.for('EffectEngine');

interface EffectInput {
  request: Record<string, unknown>;
  scriptPackage: ScriptPackage;
  voiceovers: VoicePackage[];
}

/** Effect selection based on camera movement suggestions. */
const CAMERA_TO_EFFECT: Record<string, EffectType> = {
  'slow-zoom': 'zoom',
  'slow_zoom': 'zoom',
  'zoom_in': 'zoom',
  'pan-left': 'pan',
  'pan-right': 'pan',
  'pan_left': 'pan',
  'pan_right': 'pan',
  'tracking': 'pan',
  'static': 'ken_burns',
  'handheld': 'camera_shake',
};

export class EffectEngineAgent implements IAutomationAgent<EffectInput, VideoEffect[]> {
  readonly agentId = 'automation.effects';
  readonly agentName = 'Effect Engine';
  readonly stage = 'effects';

  validate(input: EffectInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.scriptPackage?.scenes?.length) errors.push('Scenes required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Effect assignment: CPU-only'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'CPU-only' };
  }

  async execute(input: EffectInput, onProgress: ProgressCallback, _cancellation: CancellationToken): Promise<VideoEffect[]> {
    const { scriptPackage, voiceovers } = input;

    log.info('Assigning effects', { sceneCount: scriptPackage.scenes.length });
    onProgress(20, 'Analyzing scenes for effect assignment');

    const effects: VideoEffect[] = [];
    let currentMs = 0;

    for (let i = 0; i < scriptPackage.scenes.length; i++) {
      const scene = scriptPackage.scenes[i]!;
      const vo = voiceovers.find((v) => v.sceneId === scene.id);
      const durationMs = Math.round((vo?.duration ?? scene.duration ?? 5) * 1000);

      const effectType = CAMERA_TO_EFFECT[scene.cameraMovement] ?? 'ken_burns';

      // Determine intensity based on emotion
      let intensity = 0.5;
      if (['excitement', 'surprise', 'determination'].includes(scene.emotion)) intensity = 0.7;
      if (['empathy', 'hope', 'calm'].includes(scene.emotion)) intensity = 0.3;

      effects.push({
        id: generateId(ID_PREFIXES.step),
        type: effectType,
        sceneId: scene.id,
        startMs: currentMs,
        endMs: currentMs + durationMs,
        intensity,
        parameters: {
          cameraAngle: scene.cameraAngle,
          cameraMovement: scene.cameraMovement,
          emotion: scene.emotion,
        },
      });

      // Add film grain to dramatic/cinematic scenes
      if (['dramatic', 'cinematic', 'dark'].includes(scene.emotion)) {
        effects.push({
          id: generateId(ID_PREFIXES.step),
          type: 'film_grain',
          sceneId: scene.id,
          startMs: currentMs,
          endMs: currentMs + durationMs,
          intensity: 0.2,
          parameters: {},
        });
      }

      currentMs += durationMs;
      onProgress(20 + Math.round(((i + 1) / scriptPackage.scenes.length) * 70), `Effects for scene ${i + 1}`);
    }

    onProgress(100, 'Effects assigned');
    log.info('Effects assigned', { effectCount: effects.length });
    return effects;
  }
}
