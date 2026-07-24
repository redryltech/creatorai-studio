import type { Bucket } from '@google-cloud/storage';
import type { IStorageProvider, StorageUploadOptions, StorageUploadResult, StorageFileMetadata } from './storage.interface';
export declare class FirebaseStorageProvider implements IStorageProvider {
    private readonly bucket;
    readonly id = "firebase_storage";
    readonly name = "Firebase Storage";
    constructor(bucket: Bucket);
    upload(path: string, buffer: Buffer, options?: StorageUploadOptions): Promise<StorageUploadResult>;
    uploadFromUrl(path: string, sourceUrl: string, options?: StorageUploadOptions): Promise<StorageUploadResult>;
    download(path: string): Promise<Buffer>;
    getUrl(path: string, expiresInMinutes?: number): Promise<string>;
    delete(path: string): Promise<void>;
    deletePrefix(prefix: string): Promise<number>;
    exists(path: string): Promise<boolean>;
    getMetadata(path: string): Promise<StorageFileMetadata>;
    copy(sourcePath: string, destPath: string): Promise<void>;
}
//# sourceMappingURL=firebase-storage.provider.d.ts.map