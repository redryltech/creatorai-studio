// ============================================================
// CreatorAI Studio — Spatial Relationship Engine
// ============================================================
// Computes distance, visibility, occlusion, and interaction
// matrices between all nodes in a scene graph.
// ============================================================

import type { SceneGraph, SceneNode, SpatialAnalysis, Vec3 } from './scene-graph.types';

export class SpatialRelationshipEngine {
  static analyze(graph: SceneGraph): SpatialAnalysis {
    const nodes = Object.values(graph.nodes);
    const importantNodes = nodes.filter((n) => n.type !== 'root' && n.importance >= 3);

    const distanceMatrix: Record<string, Record<string, number>> = {};
    const visibilityMatrix: Record<string, Record<string, boolean>> = {};
    const occlusionMatrix: Record<string, Record<string, boolean>> = {};
    const interactionMatrix: Record<string, Record<string, string>> = {};

    for (const a of importantNodes) {
      distanceMatrix[a.id] = {};
      visibilityMatrix[a.id] = {};
      occlusionMatrix[a.id] = {};
      interactionMatrix[a.id] = {};

      for (const b of importantNodes) {
        if (a.id === b.id) continue;

        const dist = SpatialRelationshipEngine.distance(a.position, b.position);
        distanceMatrix[a.id]![b.id] = Math.round(dist * 100) / 100;

        // Visibility: both visible and within camera FOV
        visibilityMatrix[a.id]![b.id] = a.visibility > 0 && b.visibility > 0;

        // Occlusion: simplified — A occludes B if A is between camera and B
        const camZ = graph.cameraNode.position.z;
        occlusionMatrix[a.id]![b.id] = a.position.z < b.position.z && a.position.z > camZ &&
          Math.abs(a.position.x - b.position.x) < 1.5;

        // Interaction type
        if (dist < 2) interactionMatrix[a.id]![b.id] = 'contact';
        else if (dist < 5) interactionMatrix[a.id]![b.id] = 'near';
        else if (dist < 15) interactionMatrix[a.id]![b.id] = 'visible';
        else interactionMatrix[a.id]![b.id] = 'distant';
      }
    }

    return { distanceMatrix, visibilityMatrix, occlusionMatrix, interactionMatrix };
  }

  private static distance(a: Vec3, b: Vec3): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }
}
