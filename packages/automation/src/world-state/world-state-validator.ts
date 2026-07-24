// ============================================================
// CreatorAI Studio — World State Validator
// ============================================================

import type { WorldStatePackage } from './world-state.types';

export interface WorldStateValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

export class WorldStateValidator {
  static validate(pkg: WorldStatePackage): WorldStateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (!pkg.id) { errors.push('No package ID'); score -= 10; }
    if (pkg.snapshots.length === 0) { errors.push('No snapshots'); score -= 50; }

    // Snapshot validation
    const seenIds = new Set<string>();
    let prevTimestamp = -1;

    for (const snap of pkg.snapshots) {
      if (seenIds.has(snap.snapshotId)) { errors.push(`Duplicate snapshot: ${snap.snapshotId}`); score -= 10; }
      seenIds.add(snap.snapshotId);

      if (snap.timestamp < prevTimestamp) { errors.push(`Snapshot ${snap.snapshotId}: timestamp goes backward`); score -= 10; }
      prevTimestamp = snap.timestamp;

      if (!snap.sceneId) { errors.push(`Snapshot ${snap.snapshotId}: no sceneId`); score -= 5; }
      if (!snap.environment.location) { warnings.push(`Snapshot ${snap.snapshotId}: no location`); score -= 2; }

      // Check for impossible states
      if (snap.environment.rain > 0 && snap.environment.snow > 0 && snap.environment.rain + snap.environment.snow > 1.5) {
        warnings.push(`Snapshot ${snap.snapshotId}: heavy rain AND snow simultaneously`); score -= 3;
      }
    }

    // Transition validation
    for (const trans of pkg.transitions) {
      if (!trans.fromSceneId || !trans.toSceneId) { errors.push('Transition missing scene IDs'); score -= 5; }
      if (trans.transitionDuration < 0) { errors.push('Negative transition duration'); score -= 5; }
    }

    // Timeline validation
    if (pkg.timeline.totalDuration <= 0) { errors.push('Invalid total duration'); score -= 10; }
    if (pkg.timeline.sceneCount !== pkg.snapshots.length) {
      warnings.push(`Scene count mismatch: timeline=${pkg.timeline.sceneCount} vs snapshots=${pkg.snapshots.length}`);
      score -= 3;
    }

    // Metrics validation
    if (pkg.metrics.overallProductionScore < 0 || pkg.metrics.overallProductionScore > 100) {
      errors.push('Overall score out of range'); score -= 5;
    }

    return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
  }
}
