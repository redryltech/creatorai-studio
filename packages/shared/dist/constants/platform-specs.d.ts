import { Platform } from '../types/enums';
export interface PlatformSpec {
    id: Platform;
    name: string;
    video: {
        minDuration: number;
        maxDuration: number;
        maxFileSize: number;
        supportedFormats: string[];
        aspectRatios: string[];
        maxResolution: {
            width: number;
            height: number;
        };
    };
    text: {
        titleMaxLength: number;
        descriptionMaxLength: number;
        maxTags: number;
        maxTagLength: number;
        maxHashtags: number;
    };
    thumbnail: {
        width: number;
        height: number;
        maxFileSize: number;
        formats: string[];
    };
}
export declare const PLATFORM_SPECS: Record<Platform, PlatformSpec>;
//# sourceMappingURL=platform-specs.d.ts.map