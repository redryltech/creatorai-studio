import type { Firestore, CollectionReference, DocumentSnapshot, Query } from 'firebase-admin/firestore';
export interface PaginationOptions {
    page: number;
    limit: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
/**
 * Abstract base repository for Firestore collections.
 *
 * @typeParam T - The entity type (e.g., Project, Pipeline)
 */
export declare abstract class BaseRepository<T extends {
    id: string;
}> {
    protected readonly db: Firestore;
    protected readonly collectionName: string;
    constructor(db: Firestore, collectionName: string);
    /**
     * Get the Firestore collection reference.
     */
    protected get collection(): CollectionReference;
    /**
     * Convert a Firestore document to the entity type.
     * Override in subclasses for custom conversion (e.g., timestamp handling).
     */
    protected abstract fromFirestore(doc: DocumentSnapshot): T;
    /**
     * Convert an entity to Firestore-safe data.
     * Override in subclasses for custom conversion.
     */
    protected abstract toFirestore(entity: Partial<T>): Record<string, unknown>;
    /**
     * Find a document by ID.
     */
    findById(id: string): Promise<T | null>;
    /**
     * Find a document by ID, throwing if not found.
     */
    findByIdOrThrow(id: string): Promise<T>;
    /**
     * Create a new document.
     *
     * @param entity - Entity data (id will be used as document ID)
     * @returns The created entity
     */
    create(entity: T): Promise<T>;
    /**
     * Update an existing document (partial update).
     *
     * @param id - Document ID
     * @param updates - Partial entity data to merge
     */
    update(id: string, updates: Partial<T>): Promise<void>;
    /**
     * Delete a document by ID (hard delete).
     */
    delete(id: string): Promise<void>;
    /**
     * Soft delete — set deletedAt timestamp.
     */
    softDelete(id: string): Promise<void>;
    /**
     * Check if a document exists.
     */
    exists(id: string): Promise<boolean>;
    /**
     * Find documents matching a query with pagination.
     */
    findPaginated(queryFn: (ref: CollectionReference) => Query, options: PaginationOptions): Promise<PaginatedResult<T>>;
    /**
     * Find all documents matching a simple field query.
     */
    findByField(field: string, value: unknown, orderBy?: string, orderDirection?: 'asc' | 'desc', limit?: number): Promise<T[]>;
    /**
     * Batch create multiple documents.
     */
    batchCreate(entities: T[]): Promise<void>;
    /**
     * Listen to real-time changes on a document.
     * Returns an unsubscribe function.
     */
    onSnapshot(id: string, callback: (entity: T | null) => void, onError?: (error: Error) => void): () => void;
}
//# sourceMappingURL=base.repository.d.ts.map