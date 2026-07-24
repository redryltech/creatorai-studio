import type { MusicTrack } from './music-provider.interface';
export interface ScanResult {
    tracks: MusicTrack[];
    totalTracks: number;
    totalSizeBytes: number;
    totalDurationSec: number;
    categories: string[];
    duplicates: Array<{
        original: string;
        duplicate: string;
        hash: string;
    }>;
    errors: Array<{
        file: string;
        error: string;
    }>;
    scanTimeMs: number;
    cacheHit: boolean;
}
export interface MusicIndex {
    version: string;
    scannedAt: string;
    musicDir: string;
    totalTracks: number;
    totalSizeBytes: number;
    totalDurationSec: number;
    categories: string[];
    tracks: MusicTrack[];
    fileHashes: Record<string, string>;
}
export declare class MusicScanner {
    private musicDir;
    private indexPath;
    private cache;
    constructor(musicDir: string);
    /**
     * Full library scan. Checks if files changed since last scan;
     * if not, returns cached result for performance.
     */
    scan(forceRescan?: boolean): ScanResult;
    /**
     * Quick check: has anything changed since the last scan?
     */
    private isCacheValid;
    private listAllAudioFiles;
    /**
     * Extract audio metadata using FFprobe.
     */
    private extractMetadata;
    /**
     * Compute a fast content hash for duplicate detection.
     * Uses first 64KB + last 64KB for speed on large files.
     */
    private hashFile;
    private loadCachedIndex;
    private saveIndex;
    private emptyResult;
}
//# sourceMappingURL=music-scanner.d.ts.map