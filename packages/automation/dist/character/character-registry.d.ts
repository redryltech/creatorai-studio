export interface ICharacterStrategy {
    readonly strategyId: string;
    readonly strategyName: string;
    canHandle(category: string): boolean;
}
export declare class CharacterRegistry {
    private static instance;
    private strategies;
    private constructor();
    static getInstance(): CharacterRegistry;
    static resetInstance(): void;
    register(strategy: ICharacterStrategy): void;
    getStrategy(category: string): ICharacterStrategy | null;
    get size(): number;
}
//# sourceMappingURL=character-registry.d.ts.map