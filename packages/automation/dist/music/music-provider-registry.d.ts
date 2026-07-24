import type { IMusicProvider } from './music-provider.interface';
export declare class MusicProviderRegistry {
    private static instance;
    private providers;
    private constructor();
    static getInstance(): MusicProviderRegistry;
    static resetInstance(): void;
    register(provider: IMusicProvider): void;
    getPrimary(): Promise<IMusicProvider | null>;
    get(id: string): IMusicProvider | undefined;
    listIds(): string[];
    get size(): number;
}
//# sourceMappingURL=music-provider-registry.d.ts.map