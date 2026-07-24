import type { VideoTimeline, CaptionPackage } from '../types/video-production.types';
export interface FFmpegRenderOptions {
    outputDir: string;
    quality: '720p' | '1080p' | '4k';
    orientation: 'vertical' | 'horizontal' | 'square';
    fps: number;
    codec: 'h264';
}
/**
 * Render a VideoTimeline into a real MP4 file using FFmpeg.
 */
export declare function renderWithFFmpeg(timeline: VideoTimeline, captions: CaptionPackage, options: FFmpegRenderOptions, onProgress: (percent: number, message: string) => void, isCancelled: () => boolean): Promise<{
    outputPath: string;
    thumbnailPath: string;
    durationSec: number;
    sizeBytes: number;
    checksum: string;
    renderTimeMs: number;
}>;
//# sourceMappingURL=ffmpeg-renderer.d.ts.map