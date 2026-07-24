// ============================================================
// CreatorAI Studio — World State Exporter
// ============================================================

import type { WorldStatePackage, WorldStateExportFormats } from './world-state.types';

export class WorldStateExporter {
  static export(pkg: WorldStatePackage): WorldStateExportFormats {
    return {
      worldStateJson: pkg,
      timelineJson: {
        totalDuration: pkg.timeline.totalDuration,
        scenes: pkg.snapshots.map((s) => ({
          id: s.sceneId, start: s.timestamp,
          end: s.timestamp + (pkg.snapshots.find((n) => n.sceneOrder === s.sceneOrder + 1)?.timestamp ?? pkg.timeline.totalDuration) - s.timestamp,
        })),
      },
      snapshotPackage: pkg.snapshots,
      continuityReport: { score: pkg.metrics.continuityScore, issues: pkg.issues },
      repairReport: { fixes: pkg.issues.map((i) => ({ scene: i.toScene, fix: i.repair.suggestion })) },
      debugPackage: {
        snapshots: pkg.snapshots.length, transitions: pkg.transitions.length,
        issues: pkg.issues.length, metrics: pkg.metrics,
      },
    };
  }
}
