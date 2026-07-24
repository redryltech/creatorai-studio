// ============================================================
// CreatorAI Studio — Firebase Storage Service
// ============================================================
// Handles file upload, download, and management.
// Provides a clean interface over Firebase Storage.
// ============================================================

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

export class StorageService {
  private readonly bucket: Bucket;

  constructor(bucket: Bucket) {
    this.bucket = bucket;
  }

  /**
   * Upload a file buffer to Firebase Storage.
   *
   * @param path - Storage path (e.g., "users/uid/projects/pid/scene-1.png")
   * @param buffer - File content as Buffer
   * @param options - Upload options
   * @returns Upload result with public URL
   */
  async upload(
    path: string,
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const file = this.bucket.file(path);

    await file.save(buffer, {
      contentType: options.contentType ?? 'application/octet-stream',
      metadata: {
        metadata: options.metadata,
      },
    });

    // Make file publicly accessible if requested
    if (options.isPublic !== false) {
      await file.makePublic();
    }

    const [metadata] = await file.getMetadata();

    return {
      storageRef: path,
      publicUrl: `https://storage.googleapis.com/${this.bucket.name}/${path}`,
      sizeBytes: typeof metadata.size === 'string' ? parseInt(metadata.size, 10) : (metadata.size ?? 0),
      contentType: (metadata.contentType as string) ?? 'application/octet-stream',
    };
  }

  /**
   * Upload a file from a URL (download and re-upload to our storage).
   *
   * @param path - Destination storage path
   * @param sourceUrl - URL to download from
   * @param options - Upload options
   */
  async uploadFromUrl(
    path: string,
    sourceUrl: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download from ${sourceUrl}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = options.contentType ?? response.headers.get('content-type') ?? 'application/octet-stream';

    return this.upload(path, buffer, { ...options, contentType });
  }

  /**
   * Download a file from storage.
   */
  async download(path: string): Promise<Buffer> {
    const file = this.bucket.file(path);
    const [buffer] = await file.download();
    return buffer;
  }

  /**
   * Get a signed download URL (temporary access for private files).
   */
  async getSignedUrl(path: string, expiresInMinutes: number = 60): Promise<string> {
    const file = this.bucket.file(path);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  }

  /**
   * Delete a file from storage.
   */
  async deleteFile(path: string): Promise<void> {
    const file = this.bucket.file(path);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  }

  /**
   * Delete all files under a prefix (e.g., delete all project assets).
   */
  async deletePrefix(prefix: string): Promise<number> {
    const [files] = await this.bucket.getFiles({ prefix });
    if (files.length === 0) return 0;

    await Promise.all(files.map((file) => file.delete()));
    return files.length;
  }

  /**
   * Check if a file exists.
   */
  async exists(path: string): Promise<boolean> {
    const file = this.bucket.file(path);
    const [exists] = await file.exists();
    return exists;
  }

  /**
   * Get file metadata.
   */
  async getMetadata(path: string): Promise<{
    sizeBytes: number;
    contentType: string;
    created: Date;
    updated: Date;
  }> {
    const file = this.bucket.file(path);
    const [metadata] = await file.getMetadata();
    return {
      sizeBytes: typeof metadata.size === 'string' ? parseInt(metadata.size, 10) : (metadata.size ?? 0),
      contentType: (metadata.contentType as string) ?? 'unknown',
      created: new Date(metadata.timeCreated as string),
      updated: new Date(metadata.updated as string),
    };
  }
}
