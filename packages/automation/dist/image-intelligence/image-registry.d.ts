export interface IImageStrategy {
    readonly strategyId: string;
    canHandle(style: string): boolean;
}
export declare class ImageRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): ImageRegistry;
    static resetInstance(): void;
    register(s: IImageStrategy): void;
    get size(): number;
}
//# sourceMappingURL=image-registry.d.ts.map