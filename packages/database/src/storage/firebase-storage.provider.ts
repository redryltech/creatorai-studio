// ============================================================
// CreatorAI Studio — Firebase Storage Provider
// ============================================================
// Implements IStorageProvider using Firebase/Google Cloud Storage.
// ============================================================

import type { Bucket } from '@google-cloud/storage';
import { createHash } from 'crypto';
import type { IStorageProvider, StorageUploadOptions, StorageUploadResult, StorageFileMetadata } from './storage.interface';

export class FirebaseStorageProvider implements IStorageProvider {
  readonly id = 'firebase_storage';
  readonly name = 'Firebase Storage';

  constructor(private readonly bucket: Bucket) {}

  async upload(path: string, buffer: Buffer, options: StorageUploadOptions = {}): Promise<StorageUploadResult> {
    const file = this.bucket.file(path);
    const contentType = options.contentType ?? 'application/octet-stream';

    await file.save(buffer, {
      contentType,
      metadata: { metadata: options.metadata },
    });

    if (options.isPublic !== false) {
      await file.makePublic();
    }

    const checksum = createHash('sha256').update(buffer).digest('hex').slice(0, 16);

    return {
      path,
      url: `https://storage.googleapis.com/${this.bucket.name}/${path}`,
      sizeBytes: buffer.length,
      contentType,
      checksum,
    };
  }

  async uploadFromUrl(path: string, sourceUrl: string, options: StorageUploadOptions = {}): Promise<StorageUploadResult> {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Failed to download from ${sourceUrl}: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = options.contentType ?? response.headers.get('content-type') ?? 'application/octet-stream';

    return this.upload(path, buffer, { ...options, contentType });
  }

  async download(path: string): Promise<Buffer> {
    const [buffer] = await this.bucket.file(path).download();
    return buffer;
  }

  async getUrl(path: string, expiresInMinutes?: number): Promise<string> {
    if (!expiresInMinutes) {
      return `https://storage.googleapis.com/${this.bucket.name}/${path}`;
    }
    const [url] = await this.bucket.file(path).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  }

  async delete(path: string): Promise<void> {
    const file = this.bucket.file(path);
    const [exists] = await file.exists();
    if (exists) await file.delete();
  }

  async deletePrefix(prefix: string): Promise<number> {
    const [files] = await this.bucket.getFiles({ prefix });
    if (files.length === 0) return 0;
    await Promise.all(files.map((f) => f.delete()));
    return files.length;
  }

  async exists(path: string): Promise<boolean> {
    const [exists] = await this.bucket.file(path).exists();
    return exists;
  }

  async getMetadata(path: string): Promise<StorageFileMetadata> {
    const [metadata] = await this.bucket.file(path).getMetadata();
    return {
      path,
      sizeBytes: typeof metadata.size === 'string' ? parseInt(metadata.size, 10) : (metadata.size ?? 0),
      contentType: (metadata.contentType as string) ?? 'unknown',
      created: new Date(metadata.timeCreated as string),
      updated: new Date(metadata.updated as string),
      checksum: (metadata.md5Hash as string) ?? null,
    };
  }

  async copy(sourcePath: string, destPath: string): Promise<void> {
    await this.bucket.file(sourcePath).copy(this.bucket.file(destPath));
  }
}
