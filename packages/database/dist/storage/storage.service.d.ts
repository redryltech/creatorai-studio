import type { Bucket } from '@google-cloud/storage';
export interface UploadOptions {
    contentType?: string;
    metadata?: Record<string, string>;
    isPublic?: boolean;
}
export interface UploadResult {
    storageRef: string;
    publicUrl: string;
    sizeBytes: number;
    contentType: string;
}
export declare class StorageService {
    private readonly bucket;
    constructor(bucket: Bucket);
    /**
     * Upload a file buffer to Firebase Storage.
     *
     * @param path - Storage path (e.g., "users/uid/projects/pid/scene-1.png")
     * @param buffer - File content as Buffer
     * @param options - Upload options
     * @returns Upload result with public URL
     */
    upload(path: string, buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload a file from a URL (download and re-upload to our storage).
     *
     * @param path - Destination storage path
     * @param sourceUrl - URL to download from
     * @param options - Upload options
     */
    uploadFromUrl(path: string, sourceUrl: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Download a file from storage.
     */
    download(path: string): Promise<Buffer>;
    /**
     * Get a signed download URL (temporary access for private files).
     */
    getSignedUrl(path: string, expiresInMinutes?: number): Promise<string>;
    /**
     * Delete a file from storage.
     */
    deleteFile(path: string): Promise<void>;
    /**
     * Delete all files under a prefix (e.g., delete all project assets).
     */
    deletePrefix(prefix: string): Promise<number>;
    /**
     * Check if a file exists.
     */
    exists(path: string): Promise<boolean>;
    /**
     * Get file metadata.
     */
    getMetadata(path: string): Promise<{
        sizeBytes: number;
        contentType: string;
        created: Date;
        updated: Date;
    }>;
}
//# sourceMappingURL=storage.service.d.ts.map