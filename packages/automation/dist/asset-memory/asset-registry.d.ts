export interface IAssetStrategy {
    readonly strategyId: string;
    canHandle(category: string): boolean;
}
export declare class AssetRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): AssetRegistry;
    static resetInstance(): void;
    register(s: IAssetStrategy): void;
    get size(): number;
}
//# sourceMappingURL=asset-registry.d.ts.map