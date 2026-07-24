// ============================================================
// CreatorAI Studio — Scene Graph Exporter
// ============================================================

import type { SceneGraphPackage, SceneGraphExportFormats, SceneGraph } from './scene-graph.types';

export class SceneGraphExporter {
  static export(pkg: SceneGraphPackage): SceneGraphExportFormats {
    return {
      fullJson: pkg,

      compactGraph: pkg.scenes.map((g) => ({
        sceneId: g.sceneId,
        nodes: Object.keys(g.nodes).length,
        relationships: g.relationships.length,
        complexity: g.metrics.complexityScore,
      })),

      promptGraph: pkg.scenes.map((g) => {
        const nodes = Object.values(g.nodes);
        const entities = nodes.filter((n) => n.entityId).map((n) => `${n.name} at (${n.position.x.toFixed(1)},${n.position.y.toFixed(1)},${n.position.z.toFixed(1)})`);
        const cam = g.cameraNode;
        const spatialPrompt = [
          `Camera: ${cam.lens} at height ${cam.position.y.toFixed(1)}m, distance ${cam.position.z.toFixed(1)}m, FOV ${cam.fieldOfView}°`,
          `Subjects: ${entities.join('; ')}`,
          `Lights: ${g.lightNodes.map((l) => l.name).join(', ')}`,
          `Environment: ${nodes.filter((n) => ['environment', 'road', 'sky', 'mountain', 'water', 'tree'].includes(n.type)).map((n) => n.name).join(', ')}`,
        ].join('. ');
        return { sceneId: g.sceneId, spatialPrompt, entities: entities };
      }),

      visualizationGraph: pkg.scenes.map((g) => ({
        sceneId: g.sceneId,
        nodes: Object.values(g.nodes).map((n) => ({
          id: n.id, type: n.type, x: n.position.x, y: n.position.y, z: n.position.z, label: n.name,
        })),
      })),

      debugGraph: pkg.scenes.map((g) => {
        const issues: string[] = [];
        const nodes = Object.values(g.nodes);
        if (nodes.length < 3) issues.push('Very few nodes — scene may be empty');
        if (g.lightNodes.length === 0) issues.push('No lights');
        if (!g.cameraNode.targetNodeId) issues.push('Camera has no target');
        const noEntity = nodes.filter((n) => n.type === 'vehicle' || n.type === 'character').length;
        if (noEntity === 0) issues.push('No characters or vehicles');
        return { sceneId: g.sceneId, issues };
      }),
    };
  }
}
