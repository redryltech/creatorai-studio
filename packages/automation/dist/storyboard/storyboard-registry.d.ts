import type { Storyboard } from './storyboard.types';
import type { DirectorPlan } from '../director/director.types';
export interface IStoryboardStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    plan(directorPlan: DirectorPlan): Storyboard;
    canHandle(style: string): boolean;
}
export declare class StoryboardRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): StoryboardRegistry;
    static resetInstance(): void;
    register(strategy: IStoryboardStrategy): void;
    getStrategy(style: string): IStoryboardStrategy | null;
    get size(): number;
}
//# sourceMappingURL=storyboard-registry.d.ts.map