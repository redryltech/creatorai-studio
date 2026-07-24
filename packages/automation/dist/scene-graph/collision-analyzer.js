// ============================================================
// CreatorAI Studio — Collision Analyzer
// ============================================================
// Detects bounding box overlaps and spatial conflicts.
// ============================================================
export class CollisionAnalyzer {
    static analyze(graph) {
        const nodes = Object.values(graph.nodes).filter((n) => n.type !== 'root' && n.type !== 'sky' && n.type !== 'camera');
        const collisions = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                if (a.parentId === b.id || b.parentId === a.id)
                    continue; // parent-child OK
                const overlap = CollisionAnalyzer.bboxOverlap(a.boundingBox, b.boundingBox);
                if (overlap > 0) {
                    collisions.push({ nodeA: a.id, nodeB: b.id, overlap: Math.round(overlap * 100) / 100 });
                }
            }
        }
        return { collisions, totalCollisions: collisions.length };
    }
    static bboxOverlap(a, b) {
        const overlapX = Math.max(0, Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x));
        const overlapY = Math.max(0, Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y));
        const overlapZ = Math.max(0, Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z));
        return overlapX * overlapY * overlapZ;
    }
}
//# sourceMappingURL=collision-analyzer.js.map