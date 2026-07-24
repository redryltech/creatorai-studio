// ============================================================
// CreatorAI Studio — Image Intelligence Planner
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { DirectorPlan } from '../director/director.types';
import type { ImagePlanningPackage, ImageScenePlan } from './image.types';
import { CompositionEngine } from './composition-engine';
import { CameraEngine } from './camera-engine';
import { LightingEngine } from './lighting-engine';
import { StyleEngine } from './style-engine';
import { ColorEngine } from './color-engine';
import { QualityEngine } from './quality-engine';
import { IdentityLockEngine } from './identity-lock';
import { PoseEngine } from './pose-engine';
import { EnvironmentEngine } from './environment-engine';

const log = Logger.for('ImagePlanner');

const BASE_NEGATIVE = 'blurry, low quality, watermark, text overlay, logo, deformed, bad anatomy, extra limbs, disfigured, cropped, jpeg artifacts, ugly, duplicate, morbid, poorly drawn, low resolution, grainy, noisy';

export class ImagePlanner {
  static plan(
    storyboard: Storyboard,
    charDb: CharacterDatabase,
    directorPlan?: DirectorPlan,
    sceneGraphPkg?: SceneGraphPackage,
    worldStatePkg?: WorldStatePackage,
    assetMemPkg?: AssetMemoryPackage,
  ): ImagePlanningPackage {
    const startTime = performance.now();
    log.info('Image intelligence planning', { frames: storyboard.frames.length });

    const globalStyle = StyleEngine.analyze(directorPlan);
    const globalColor = ColorEngine.analyze(directorPlan);
    const globalIdentity = IdentityLockEngine.lock(storyboard.frames[0]?.sceneId ?? '', charDb, assetMemPkg);

    const scenes: ImageScenePlan[] = storyboard.frames.map((frame, i) => {
      const dirScene = directorPlan?.scenes[i];
      const worldSnap = worldStatePkg?.snapshots[i];

      // Run all analyzers
      const composition = CompositionEngine.analyze(frame);
      const camera = CameraEngine.analyze(frame, dirScene);
      const lighting = LightingEngine.analyze(dirScene, worldSnap);
      const style = StyleEngine.analyze(directorPlan);
      const color = ColorEngine.analyze(directorPlan);
      const environment = EnvironmentEngine.analyze(dirScene, worldSnap);
      const identity = IdentityLockEngine.lock(frame.sceneId, charDb, assetMemPkg);
      const hasHuman = charDb.entities.some((e) => e.category === 'human' && e.scenePresence.includes(frame.sceneId));
      const pose = PoseEngine.analyze(dirScene?.sceneEmotion ?? 'neutral', hasHuman);

      // Build master prompt from all analyzers
      const promptParts: string[] = [
        frame.composition.mainSubject,
        frame.frameDescription,
        `${camera.lens} lens, ${camera.angle.replace(/_/g, ' ')} angle, ${camera.distance} shot`,
        lighting.lightingSummary,
        `${environment.setting} setting, ${environment.timeOfDay}, ${environment.weather}`,
        ...environment.particleEffects.map((e) => e),
        `${color.gradingLut.replace(/_/g, ' ')} color grading, ${color.mood}`,
        style.stylePrompt,
        ...identity.vehicleLock.map((v) => `${v.color} ${v.identityBlock.split('\n')[1]?.replace('Always use: ', '') ?? ''}`),
        ...identity.characterLock.map((c) => c.identityBlock.split('\n').slice(1, 3).join(', ')),
        pose ? `${pose.bodyPose}, ${pose.expression}, ${pose.dynamicAction}` : '',
        `${frame.style.aspectRatio} vertical composition`,
        'highly detailed, professional quality, 8k, masterpiece',
      ].filter(Boolean);

      const masterPrompt = promptParts.join(', ');

      // Build negative prompt (entity-aware)
      const negParts = [BASE_NEGATIVE];
      for (const v of identity.vehicleLock) {
        const rightColor = v.color.toLowerCase();
        const wrong = ['red', 'blue', 'white', 'silver', 'orange', 'yellow', 'pink'].filter((c) => c !== rightColor);
        negParts.push(...wrong.slice(0, 3).map((c) => `${c} vehicle`));
      }
      const negativePrompt = negParts.join(', ');

      // Reference prompt (for consistency)
      const referencePrompt = identity.vehicleLock.map((v) => v.identityBlock).concat(identity.characterLock.map((c) => c.identityBlock)).join('\n');

      // Provider hints
      const providerHints: Record<string, string> = {
        flux: `${masterPrompt}, photorealistic`,
        pollinations: masterPrompt,
        replicate: `${masterPrompt}, high quality`,
        dall_e: masterPrompt,
        midjourney: `${masterPrompt} --ar 9:16 --v 6 --style raw`,
        imagen: `${masterPrompt}, photographic quality`,
        openai: masterPrompt,
      };

      const seed = identity.sceneSeed;

      // Quality scoring (without circular reference)
      const partialPlan = { sceneId: frame.sceneId, sceneOrder: frame.sceneOrder, composition, camera, lighting, style, color, environment, identity, pose, seed, aspectRatio: '9:16', resolution: '1080x1920', masterPrompt, negativePrompt, referencePrompt, providerHints };
      const quality = QualityEngine.score(partialPlan);
      const confidence = Math.min(100, Math.round(quality.overallScore * 0.6 + identity.consistencyScore * 0.4));

      return { ...partialPlan, quality, confidence };
    });

    const processingTimeMs = Math.round(performance.now() - startTime);
    const avgQuality = Math.round(scenes.reduce((s, sc) => s + sc.quality.overallScore, 0) / Math.max(scenes.length, 1));
    const avgConfidence = Math.round(scenes.reduce((s, sc) => s + sc.confidence, 0) / Math.max(scenes.length, 1));

    log.info('Image planning complete', { scenes: scenes.length, avgQuality, avgConfidence, processingTimeMs });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: storyboard.title,
      scenes, globalStyle, globalColor, globalIdentity,
      metadata: { totalScenes: scenes.length, avgQuality, avgConfidence, generatedAt: new Date().toISOString(), engine: 'image-intelligence-v1', processingTimeMs },
    };
  }
}
