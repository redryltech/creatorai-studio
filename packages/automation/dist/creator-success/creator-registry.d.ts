export interface ICreatorStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    canHandle(platform: string): boolean;
}
export declare class CreatorRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): CreatorRegistry;
    static resetInstance(): void;
    register(s: ICreatorStrategy): void;
    getStrategy(platform: string): ICreatorStrategy | null;
    get size(): number;
}
//# sourceMappingURL=creator-registry.d.ts.map