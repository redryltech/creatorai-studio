export interface IWorldStateStrategy {
    readonly strategyId: string;
    canHandle(category: string): boolean;
}
export declare class WorldStateRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): WorldStateRegistry;
    static resetInstance(): void;
    register(strategy: IWorldStateStrategy): void;
    get size(): number;
}
//# sourceMappingURL=world-state-registry.d.ts.map