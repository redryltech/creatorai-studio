import type { ScriptPackage } from '../types/automation.types';
import type { DirectorPlan } from './director.types';
export declare class DirectorPlanner {
    /**
     * Produce a complete DirectorPlan from a ScriptPackage.
     * Pure function — no side effects, no API calls.
     */
    static plan(script: ScriptPackage, title?: string): DirectorPlan;
    private static planScene;
    static detectCategory(text: string, script: ScriptPackage): string;
    private static determineImportance;
    private static selectCameraMovement;
    private static selectSubjectPosition;
    private static selectWeather;
    private static selectMotionIntensity;
    private static detectEnvironment;
    private static inferGoal;
    private static harmonizeTransitions;
    private static selectThumbnail;
    private static buildConsistencyNotes;
    private static extractCharacterDescription;
    private static findRecurringElements;
    private static getColorPalette;
}
//# sourceMappingURL=director-planner.d.ts.map