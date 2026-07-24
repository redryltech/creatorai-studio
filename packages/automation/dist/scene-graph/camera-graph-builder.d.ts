import type { CameraNode } from './scene-graph.types';
export declare class CameraGraphBuilder {
    /**
     * Enhance a camera node with motion path keyframes
     * based on camera movement type from the storyboard.
     */
    static buildMotionPath(camera: CameraNode, movement: string, duration: number): CameraNode;
    private static interpolatePosition;
    private static interpolateFov;
}
//# sourceMappingURL=camera-graph-builder.d.ts.map