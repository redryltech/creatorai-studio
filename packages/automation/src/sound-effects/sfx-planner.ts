import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { SfxPackage, SceneSfxPlan, SoundEffect } from './sfx.types';
import { SfxGenerator } from './sfx-generator';

const log = Logger.for('SfxPlanner');

export class SfxPlanner {
  static generate(
    scenes: Array<{ id: string; order: number; narration: string; visualNotes: string }>,
    outputDir: string,
  ): SfxPackage {
    const startTime = performance.now();
    log.info('SFX planning', { scenes: scenes.length });

    const scenePlans: SceneSfxPlan[] = [];
    const categories: Record<string, number> = {};
    let totalEffects = 0;

    for (const scene of scenes) {
      const sceneText = `${scene.narration} ${scene.visualNotes}`;
      const selection = SfxGenerator.selectForScene(sceneText, scene.order);
      const effects: SoundEffect[] = [];

      // Generate selected effects
      for (const effectName of selection.effects) {
        const sfx = SfxGenerator.generate(effectName, outputDir);
        if (sfx) {
          effects.push(sfx);
          categories[sfx.category] = (categories[sfx.category] ?? 0) + 1;
        }
      }

      // Generate ambient track
      let ambientTrack: SoundEffect | null = null;
      if (selection.ambient) {
        ambientTrack = SfxGenerator.generate(selection.ambient, outputDir);
        if (ambientTrack) categories[ambientTrack.category] = (categories[ambientTrack.category] ?? 0) + 1;
      }

      // Generate transition
      let transitionEffect: SoundEffect | null = null;
      if (selection.transition) {
        transitionEffect = SfxGenerator.generate(selection.transition, outputDir);
        if (transitionEffect) categories[transitionEffect.category] = (categories[transitionEffect.category] ?? 0) + 1;
      }

      const count = effects.length + (ambientTrack ? 1 : 0) + (transitionEffect ? 1 : 0);
      totalEffects += count;

      scenePlans.push({
        sceneId: scene.id,
        sceneOrder: scene.order,
        effects,
        ambientTrack,
        transitionEffect,
        totalEffects: count,
      });

      log.info('Scene SFX planned', { scene: scene.order, effects: effects.length, ambient: !!ambientTrack, transition: !!transitionEffect });
    }

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: '',
      scenePlans,
      mixedOutputPath: null,
      metadata: { totalEffects, totalScenes: scenes.length, categories, generatedAt: new Date().toISOString(), engine: 'sfx-engine-v1', processingTimeMs },
    };
  }
}
