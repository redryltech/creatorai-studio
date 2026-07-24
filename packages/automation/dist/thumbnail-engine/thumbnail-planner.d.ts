import type { ThumbnailPackage } from './thumbnail.types';
export declare class ThumbnailPlanner {
    /**
     * Generate a complete thumbnail package.
     *
     * Strategy:
     * 1. Extract best frame from video (if available)
     * 2. Generate AI images optimized for thumbnails
     * 3. Add text overlays via FFmpeg
     * 4. Score each variant for CTR
     * 5. Select best and create A/B test variants
     */
    static plan(topic: string, videoPath: string | null, bestFrameTimeSec: number, colorPalette: string[], category: string, outputDir?: string): Promise<ThumbnailPackage>;
    private static generatePrompts;
    private static predictCtr;
    private static analyzeAll;
    private static generateShortTitle;
}
//# sourceMappingURL=thumbnail-planner.d.ts.map