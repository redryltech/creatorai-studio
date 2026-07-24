import type { IMusicProvider, MusicTrack, MusicSearchRequest, MusicSelectionResult, MusicProviderCapabilities } from './music-provider.interface';
import { MusicScanner } from './music-scanner';
export interface LocalMusicProviderConfig {
    /** Path to assets/music/ directory */
    musicDir: string;
    /** Path to music-index.json */
    indexPath?: string;
}
export declare class LocalMusicProvider implements IMusicProvider {
    readonly providerId = "local_music";
    readonly providerName = "Local Music Library";
    readonly priority = 0;
    private readonly musicDir;
    private readonly indexPath;
    private readonly scanner;
    private tracks;
    private loaded;
    constructor(config: LocalMusicProviderConfig);
    /** Force a rescan of the music library. Returns scan results. */
    rescan(): {
        totalTracks: number;
        categories: string[];
    };
    /** Get the scanner instance for direct access. */
    getScanner(): MusicScanner;
    isAvailable(): Promise<boolean>;
    getCapabilities(): MusicProviderCapabilities;
    getTrack(trackId: string): Promise<MusicTrack | null>;
    getRandomTrack(category?: string): Promise<MusicTrack | null>;
    searchTracks(request: MusicSearchRequest): Promise<MusicTrack[]>;
    /**
     * AI-powered music selection — analyzes topic, emotions, and mood
     * to find the best matching track.
     */
    selectTrack(request: MusicSearchRequest): Promise<MusicSelectionResult>;
    validate(track: MusicTrack): Promise<{
        valid: boolean;
        error?: string;
    }>;
    private ensureLoaded;
    private saveIndex;
}
//# sourceMappingURL=local-music.provider.d.ts.map