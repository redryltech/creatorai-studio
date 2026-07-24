import type { VersionEntry } from './asset.types';
export declare class VersionManager {
    private versions;
    addVersion(assetId: string, version: string, changes: string, data: Record<string, unknown>): void;
    getHistory(assetId: string): VersionEntry[];
    getLatest(assetId: string): VersionEntry | undefined;
    rollback(assetId: string, version: string): VersionEntry | undefined;
    diff(assetId: string, v1: string, v2: string): {
        added: string[];
        removed: string[];
        changed: string[];
    };
    get totalVersions(): number;
}
//# sourceMappingURL=version-manager.d.ts.map