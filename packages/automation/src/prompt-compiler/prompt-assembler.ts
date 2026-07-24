// ============================================================
// CreatorAI Studio — Prompt Assembler
// ============================================================
// Assembles prompt blocks from all upstream planning data.
// Each block is a structured segment of the final prompt.
// ============================================================

import type { StoryboardFrame } from '../storyboard/storyboard.types';
import type { DirectorScenePlan } from '../director/director.types';
import type { CharacterDatabase, EntityIdentity } from '../character/character.types';
import type { WorldSnapshot } from '../world-state/world-state.types';
import type { BrandKit, StyleGuide } from '../asset-memory/asset.types';
import type { PromptBlock } from './prompt.types';

export class PromptAssembler {
  /**
   * Assemble all prompt blocks for a single scene.
   */
  static assemble(
    frame: StoryboardFrame,
    dirScene: DirectorScenePlan | undefined,
    charDb: CharacterDatabase,
    worldSnap: WorldSnapshot | undefined,
    brandKit: BrandKit | null,
    styleGuide: StyleGuide | null,
  ): PromptBlock[] {
    const blocks: PromptBlock[] = [];
    let blockId = 0;
    const bk = (type: PromptBlock['type'], content: string, priority: number): void => {
      if (!content.trim()) return;
      blocks.push({ id: `blk_${++blockId}`, type, content: content.trim(), priority, tokenEstimate: Math.ceil(content.split(/\s+/).length * 1.3) });
    };

    // ── Visual Block ──
    bk('visual', [
      frame.composition.mainSubject,
      frame.frameDescription,
      frame.visualGoal,
    ].filter(Boolean).join(', '), 10);

    // ── Camera Block ──
    const camParts = [
      frame.camera.lens ? `${frame.camera.lens} lens` : '',
      frame.camera.position ? `${frame.camera.position.replace(/_/g, ' ')} camera` : '',
      frame.camera.fov ? `${frame.camera.fov} field of view` : '',
      dirScene?.cameraMovement ? `${dirScene.cameraMovement.replace(/_/g, ' ')} movement` : '',
      dirScene?.shotDescription ?? '',
    ].filter(Boolean);
    bk('camera', camParts.join(', '), 9);

    // ── Character Block ──
    const sceneEntities = charDb.entities.filter((e) =>
      e.scenePresence.includes(frame.sceneId) && (e.category === 'human' || e.category === 'animal'),
    );
    if (sceneEntities.length > 0) {
      const charLines = sceneEntities.map((e) => e.identityBlock.split('\n').slice(1).join(', ')).join('; ');
      bk('character', charLines, 8);
    }

    // ── Vehicle Block ──
    const vehicleEntities = charDb.entities.filter((e) =>
      e.scenePresence.includes(frame.sceneId) && e.category === 'vehicle',
    );
    if (vehicleEntities.length > 0) {
      const vehLines = vehicleEntities.map((e) => {
        const vp = e.vehicleProfile;
        if (!vp) return e.displayName;
        return `${vp.primaryColor} ${vp.manufacturer} ${vp.model}, ${vp.paintFinish} finish, ${vp.wheelDesign} wheels, ${vp.exhaust} exhaust, ${vp.damageState} condition`;
      }).join('; ');
      bk('vehicle', vehLines, 9);
    }

    // ── Environment Block ──
    const envParts = [
      dirScene?.environment ? `${dirScene.environment.replace(/_/g, ' ')} setting` : '',
      dirScene?.timeOfDay ? dirScene.timeOfDay.replace(/_/g, ' ') : '',
      dirScene?.weather && dirScene.weather !== 'clear' ? `${dirScene.weather} weather` : '',
      worldSnap?.environment.terrain ? `${worldSnap.environment.terrain} terrain` : '',
      frame.composition.background,
    ].filter(Boolean);
    bk('environment', envParts.join(', '), 7);

    // ── Motion Block ──
    const motionParts = [
      frame.motion.subjectMotion !== 'idle' ? `subject: ${frame.motion.subjectMotion}` : '',
      frame.motion.cameraMotion !== 'static' ? `camera: ${frame.motion.cameraMotion}` : '',
      frame.motion.particleMotion !== 'None' ? frame.motion.particleMotion : '',
      dirScene?.motionIntensity ? `${dirScene.motionIntensity} intensity` : '',
    ].filter(Boolean);
    if (motionParts.length > 0) bk('motion', motionParts.join(', '), 6);

    // ── Lighting Block ──
    const lightParts = [
      dirScene?.lighting ? `${dirScene.lighting.replace(/_/g, ' ')} lighting` : '',
      dirScene?.lightingIntensity ? `${dirScene.lightingIntensity} intensity` : '',
      dirScene?.shadowStyle ? `${dirScene.shadowStyle} shadows` : '',
      worldSnap?.lighting ? `${worldSnap.lighting.temperature}K color temperature` : '',
    ].filter(Boolean);
    bk('lighting', lightParts.join(', '), 8);

    // ── Effects Block ──
    const effects = dirScene?.visualEffects?.map((e) => e.replace(/_/g, ' ')) ?? [];
    if (effects.length > 0) bk('effects', effects.join(', '), 5);

    // ── Composition Block ──
    bk('composition', [
      `Foreground: ${frame.composition.foreground}`,
      `Subject position: ${frame.composition.ruleOfThirdsPosition?.replace(/_/g, ' ')}`,
      `Depth: ${frame.composition.depthLayout}`,
      frame.composition.negativeSpace !== 'balanced' ? `${frame.composition.negativeSpace} negative space` : '',
    ].filter(Boolean).join(', '), 5);

    // ── Brand Block ──
    if (brandKit) {
      bk('brand', [
        styleGuide?.visualStyle ?? brandKit.animationStyle,
        `brand colors: ${brandKit.primaryColors.join(', ')}`,
      ].join(', '), 4);
    }

    // ── Continuity Block ──
    const contParts = [
      frame.continuity.colorGrading ? `maintain ${frame.continuity.colorGrading}` : '',
      frame.continuity.vehicle ? `vehicle: ${frame.continuity.vehicle}` : '',
      dirScene?.colorGrading ? `${dirScene.colorGrading.replace(/_/g, ' ')} color grading` : '',
    ].filter(Boolean);
    if (contParts.length > 0) bk('continuity', contParts.join(', '), 6);

    return blocks;
  }
}
