export interface ISceneGraphStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    canHandle(category: string): boolean;
}
export declare class SceneGraphRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): SceneGraphRegistry;
    static resetInstance(): void;
    register(strategy: ISceneGraphStrategy): void;
    get size(): number;
}
//# sourceMappingURL=scene-graph-registry.d.ts.map