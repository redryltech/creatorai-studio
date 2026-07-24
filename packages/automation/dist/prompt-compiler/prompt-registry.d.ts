export interface IPromptStrategy {
    readonly strategyId: string;
    canHandle(category: string): boolean;
}
export declare class PromptRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): PromptRegistry;
    static resetInstance(): void;
    register(s: IPromptStrategy): void;
    get size(): number;
}
//# sourceMappingURL=prompt-registry.d.ts.map