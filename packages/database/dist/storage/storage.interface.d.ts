export interface IStorageProvider {
    readonly id: string;
    readonly name: string;
    /**
     * Upload a file from a buffer.
     */
    upload(path: string, buffer: Buffer, options?: StorageUploadOptions): Promise<StorageUploadResult>;
    /**
     * Upload a file from a remote URL (download + re-upload).
     */
    uploadFromUrl(path: string, sourceUrl: string, options?: StorageUploadOptions): Promise<StorageUploadResult>;
    /**
     * Download a file to a buffer.
     */
    download(path: string): Promise<Buffer>;
    /**
     * Get a signed/public URL for a file.
     */
    getUrl(path: string, expiresInMinutes?: number): Promise<string>;
    /**
     * Delete a single file.
     */
    delete(path: string): Promise<void>;
    /**
     * Delete all files under a prefix (folder deletion).
     */
    deletePrefix(prefix: string): Promise<number>;
    /**
     * Check if a file exists.
     */
    exists(path: string): Promise<boolean>;
    /**
     * Get file metadata.
     */
    getMetadata(path: string): Promise<StorageFileMetadata>;
    /**
     * Copy a file to a new path (used for versioning).
     */
    copy(sourcePath: string, destPath: string): Promise<void>;
}
export interface StorageUploadOptions {
    contentType?: string;
    metadata?: Record<string, string>;
    isPublic?: boolean;
}
export interface StorageUploadResult {
    path: string;
    url: string;
    sizeBytes: number;
    contentType: string;
    checksum: string;
}
export interface StorageFileMetadata {
    path: string;
    sizeBytes: number;
    contentType: string;
    created: Date;
    updated: Date;
    checksum: string | null;
}
//# sourceMappingURL=storage.interface.d.ts.map