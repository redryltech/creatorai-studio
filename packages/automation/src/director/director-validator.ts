// ============================================================
// CreatorAI Studio — Director Validator
// ============================================================
// Validates a DirectorPlan for completeness, consistency,
// and production readiness before passing to downstream agents.
// ============================================================

import type { DirectorPlan, DirectorScenePlan } from './director.types';

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

export class DirectorValidator {
  /**
   * Validate a DirectorPlan for production readiness.
   */
  static validate(plan: DirectorPlan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // ── Plan-level checks ──

    if (!plan.id) { errors.push('Plan has no ID'); score -= 10; }
    if (!plan.scenes.length) { errors.push('Plan has no scenes'); score -= 50; }
    if (!plan.globalStyle) { warnings.push('No global style set'); score -= 5; }
    if (!plan.globalColorGrading) { warnings.push('No global color grading'); score -= 5; }
    if (plan.colorPalette.length === 0) { warnings.push('Empty color palette'); score -= 3; }

    // ── Duration check ──
    const totalDuration = plan.scenes.reduce((s, sc) => s + sc.sceneDuration, 0);
    if (totalDuration < 10) { errors.push(`Total duration too short: ${totalDuration}s`); score -= 20; }
    if (totalDuration > 180) { warnings.push(`Total duration very long: ${totalDuration}s`); score -= 5; }

    // ── Scene-level checks ──
    const seenIds = new Set<string>();

    for (const scene of plan.scenes) {
      // Duplicate IDs
      if (seenIds.has(scene.sceneId)) {
        errors.push(`Duplicate scene ID: ${scene.sceneId}`);
        score -= 10;
      }
      seenIds.add(scene.sceneId);

      // Required fields
      if (!scene.sceneGoal) { warnings.push(`Scene ${scene.sceneOrder}: no goal`); score -= 2; }
      if (!scene.cameraStyle) { errors.push(`Scene ${scene.sceneOrder}: no camera style`); score -= 5; }
      if (!scene.lens) { errors.push(`Scene ${scene.sceneOrder}: no lens`); score -= 5; }
      if (!scene.lighting) { errors.push(`Scene ${scene.sceneOrder}: no lighting`); score -= 5; }
      if (!scene.environment) { errors.push(`Scene ${scene.sceneOrder}: no environment`); score -= 5; }
      if (!scene.colorGrading) { errors.push(`Scene ${scene.sceneOrder}: no color grading`); score -= 5; }
      if (scene.sceneDuration <= 0) { errors.push(`Scene ${scene.sceneOrder}: invalid duration`); score -= 10; }
      if (!scene.narration) { warnings.push(`Scene ${scene.sceneOrder}: no narration`); score -= 2; }

      // Visual effects sanity
      if (scene.visualEffects.length > 5) {
        warnings.push(`Scene ${scene.sceneOrder}: too many effects (${scene.visualEffects.length})`);
        score -= 2;
      }
    }

    // ── Consistency checks ──

    // At least one hook scene
    if (!plan.scenes.some((s) => s.sceneImportance === 'hook')) {
      warnings.push('No hook scene identified');
      score -= 5;
    }

    // At least one thumbnail candidate
    if (!plan.scenes.some((s) => s.thumbnailCandidate)) {
      warnings.push('No thumbnail candidate selected');
      score -= 3;
    }

    // Scene order must be sequential
    const orders = plan.scenes.map((s) => s.sceneOrder);
    const sorted = [...orders].sort((a, b) => a - b);
    if (JSON.stringify(orders) !== JSON.stringify(sorted)) {
      warnings.push('Scenes are not in sequential order');
      score -= 5;
    }

    // Transition coherence — first scene should fade in, last should fade out
    const first = plan.scenes[0];
    const last = plan.scenes[plan.scenes.length - 1];
    if (first && first.transitionIn !== 'fade') {
      warnings.push('First scene should fade in');
      score -= 2;
    }
    if (last && last.transitionOut !== 'fade') {
      warnings.push('Last scene should fade out');
      score -= 2;
    }

    // Camera variety — avoid using the same camera for all scenes
    const cameras = new Set(plan.scenes.map((s) => s.cameraStyle));
    if (cameras.size === 1 && plan.scenes.length > 2) {
      warnings.push('All scenes use the same camera style — add variety');
      score -= 5;
    }

    return {
      valid: errors.length === 0,
      score: Math.max(0, Math.min(100, score)),
      errors,
      warnings,
    };
  }

  /**
   * Quick validation of a single scene.
   */
  static validateScene(scene: DirectorScenePlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!scene.sceneId) errors.push('Missing sceneId');
    if (!scene.cameraStyle) errors.push('Missing cameraStyle');
    if (!scene.lens) errors.push('Missing lens');
    if (!scene.lighting) errors.push('Missing lighting');
    if (!scene.environment) errors.push('Missing environment');
    if (scene.sceneDuration <= 0) errors.push('Invalid duration');
    return { valid: errors.length === 0, errors };
  }
}
