export * from './firestore/collections';
export * from './firestore/repositories';

// Storage
export type { IStorageProvider, StorageUploadOptions, StorageUploadResult, StorageFileMetadata } from './storage/storage.interface';
export { FirebaseStorageProvider } from './storage/firebase-storage.provider';

// Legacy — kept for backwards compatibility
export { StorageService, type UploadOptions, type UploadResult } from './storage/storage.service';
