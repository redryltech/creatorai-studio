import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from './storyboard.types';
export declare class StoryboardPlanner {
    /**
     * Transform a DirectorPlan into a complete Storyboard.
     */
    static plan(directorPlan: DirectorPlan): Storyboard;
    private static buildFrame;
    private static buildComposition;
    private static buildCameraInfo;
    private static describeCameraPath;
    private static buildMotionPlan;
    private static buildTiming;
    private static buildAssets;
    private static buildStyle;
    private static buildContinuity;
    private static buildPrompts;
    private static buildFrameDescription;
    private static buildVisualGoal;
    private static buildGlobalStyle;
    private static buildGlobalContinuity;
}
//# sourceMappingURL=storyboard-planner.d.ts.map