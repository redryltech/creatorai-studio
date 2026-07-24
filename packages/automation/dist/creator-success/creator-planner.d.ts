import type { CreatorSuccessPackage } from './creator.types';
export interface CreatorPlannerInput {
    topic: string;
    category: string;
    title: string;
    hookText: string;
    fullNarration: string;
    sceneDurations: number[];
    totalDuration: number;
    keywords: string[];
    bestPlatform: string;
    audienceSize: string;
    hasThumbnailText: boolean;
    hasThumbnailSubject: boolean;
    hasThumbnailContrast: boolean;
}
export declare class CreatorPlanner {
    /**
     * Run all 13 analyzers and produce the CreatorSuccessPackage.
     */
    static plan(input: CreatorPlannerInput): CreatorSuccessPackage;
}
//# sourceMappingURL=creator-planner.d.ts.map