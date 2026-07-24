import type { DirectorPlan } from './director.types';
import type { ScriptPackage } from '../types/automation.types';
export interface IDirectorStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    readonly supportedCategories: string[];
    plan(script: ScriptPackage, title?: string): DirectorPlan;
    canHandle(category: string): boolean;
}
export declare class DirectorRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): DirectorRegistry;
    static resetInstance(): void;
    register(strategy: IDirectorStrategy): void;
    /**
     * Get the best strategy for a content category.
     */
    getStrategy(category: string): IDirectorStrategy | null;
    listStrategies(): Array<{
        id: string;
        name: string;
        categories: string[];
    }>;
    get size(): number;
}
//# sourceMappingURL=director-registry.d.ts.map