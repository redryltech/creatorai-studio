/** Strategy interface for pluggable research analyzers. */
export interface IResearchStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    canHandle(category: string): boolean;
}
/**
 * Registry for research strategies.
 * Supports plugging in specialized analyzers for specific categories.
 */
export declare class ResearchRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): ResearchRegistry;
    static resetInstance(): void;
    register(strategy: IResearchStrategy): void;
    getStrategy(category: string): IResearchStrategy | null;
    listStrategies(): Array<{
        id: string;
        name: string;
    }>;
    get size(): number;
}
//# sourceMappingURL=research-registry.d.ts.map