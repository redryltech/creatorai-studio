// ============================================================
// CreatorAI Studio — Firebase Storage Provider
// ============================================================
// Implements IStorageProvider using Firebase/Google Cloud Storage.
// ============================================================
import { createHash } from 'crypto';
export class FirebaseStorageProvider {
    bucket;
    id = 'firebase_storage';
    name = 'Firebase Storage';
    constructor(bucket) {
        this.bucket = bucket;
    }
    async upload(path, buffer, options = {}) {
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
    async uploadFromUrl(path, sourceUrl, options = {}) {
        const response = await fetch(sourceUrl);
        if (!response.ok)
            throw new Error(`Failed to download from ${sourceUrl}: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = options.contentType ?? response.headers.get('content-type') ?? 'application/octet-stream';
        return this.upload(path, buffer, { ...options, contentType });
    }
    async download(path) {
        const [buffer] = await this.bucket.file(path).download();
        return buffer;
    }
    async getUrl(path, expiresInMinutes) {
        if (!expiresInMinutes) {
            return `https://storage.googleapis.com/${this.bucket.name}/${path}`;
        }
        const [url] = await this.bucket.file(path).getSignedUrl({
            action: 'read',
            expires: Date.now() + expiresInMinutes * 60 * 1000,
        });
        return url;
    }
    async delete(path) {
        const file = this.bucket.file(path);
        const [exists] = await file.exists();
        if (exists)
            await file.delete();
    }
    async deletePrefix(prefix) {
        const [files] = await this.bucket.getFiles({ prefix });
        if (files.length === 0)
            return 0;
        await Promise.all(files.map((f) => f.delete()));
        return files.length;
    }
    async exists(path) {
        const [exists] = await this.bucket.file(path).exists();
        return exists;
    }
    async getMetadata(path) {
        const [metadata] = await this.bucket.file(path).getMetadata();
        return {
            path,
            sizeBytes: typeof metadata.size === 'string' ? parseInt(metadata.size, 10) : (metadata.size ?? 0),
            contentType: metadata.contentType ?? 'unknown',
            created: new Date(metadata.timeCreated),
            updated: new Date(metadata.updated),
            checksum: metadata.md5Hash ?? null,
        };
    }
    async copy(sourcePath, destPath) {
        await this.bucket.file(sourcePath).copy(this.bucket.file(destPath));
    }
}
//# sourceMappingURL=firebase-storage.provider.js.map