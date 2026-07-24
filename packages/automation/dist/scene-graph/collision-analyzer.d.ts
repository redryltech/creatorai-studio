import type { SceneGraph } from './scene-graph.types';
export interface CollisionResult {
    collisions: Array<{
        nodeA: string;
        nodeB: string;
        overlap: number;
    }>;
    totalCollisions: number;
}
export declare class CollisionAnalyzer {
    static analyze(graph: SceneGraph): CollisionResult;
    private static bboxOverlap;
}
//# sourceMappingURL=collision-analyzer.d.ts.map