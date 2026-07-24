import type { FeatureFlag, PlanTier } from '../types/enterprise.types';
export declare class FeatureFlagService {
    private static instance;
    private flags;
    private constructor();
    static getInstance(): FeatureFlagService;
    static resetInstance(): void;
    private register;
    /** Check if a feature is enabled for a given plan. */
    isEnabled(featureName: string, plan: PlanTier, organizationId?: string): boolean;
    /** Get all flags. */
    getAll(): FeatureFlag[];
    /** Update a flag. */
    update(name: string, updates: Partial<Pick<FeatureFlag, 'enabled' | 'allowedPlans' | 'percentage'>>): void;
}
//# sourceMappingURL=feature-flags.d.ts.map