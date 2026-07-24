// ============================================================
// CreatorAI Studio — Base Repository
// ============================================================
// Generic Firestore CRUD repository using the Repository pattern.
// All entity-specific repositories extend this base class.
//
// The Repository pattern isolates Firestore-specific logic so
// if we ever migrate to PostgreSQL, MongoDB, or another DB,
// we only change the repository implementations — not the
// services or controllers that use them.
// ============================================================
/**
 * Abstract base repository for Firestore collections.
 *
 * @typeParam T - The entity type (e.g., Project, Pipeline)
 */
export class BaseRepository {
    db;
    collectionName;
    constructor(db, collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }
    /**
     * Get the Firestore collection reference.
     */
    get collection() {
        return this.db.collection(this.collectionName);
    }
    /**
     * Find a document by ID.
     */
    async findById(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists)
            return null;
        return this.fromFirestore(doc);
    }
    /**
     * Find a document by ID, throwing if not found.
     */
    async findByIdOrThrow(id) {
        const entity = await this.findById(id);
        if (!entity) {
            throw new Error(`${this.collectionName} document not found: ${id}`);
        }
        return entity;
    }
    /**
     * Create a new document.
     *
     * @param entity - Entity data (id will be used as document ID)
     * @returns The created entity
     */
    async create(entity) {
        const data = this.toFirestore(entity);
        await this.collection.doc(entity.id).set(data);
        return entity;
    }
    /**
     * Update an existing document (partial update).
     *
     * @param id - Document ID
     * @param updates - Partial entity data to merge
     */
    async update(id, updates) {
        const data = this.toFirestore(updates);
        await this.collection.doc(id).update({
            ...data,
            updatedAt: new Date(),
        });
    }
    /**
     * Delete a document by ID (hard delete).
     */
    async delete(id) {
        await this.collection.doc(id).delete();
    }
    /**
     * Soft delete — set deletedAt timestamp.
     */
    async softDelete(id) {
        await this.collection.doc(id).update({
            deletedAt: new Date(),
            updatedAt: new Date(),
        });
    }
    /**
     * Check if a document exists.
     */
    async exists(id) {
        const doc = await this.collection.doc(id).get();
        return doc.exists;
    }
    /**
     * Find documents matching a query with pagination.
     */
    async findPaginated(queryFn, options) {
        const { page, limit, orderBy = 'createdAt', orderDirection = 'desc' } = options;
        // Get total count (Firestore doesn't have built-in count for complex queries,
        // so we use a count aggregation query)
        const countQuery = queryFn(this.collection).count();
        const countSnapshot = await countQuery.get();
        const total = countSnapshot.data().count;
        // Get paginated results
        const offset = (page - 1) * limit;
        const snapshot = await queryFn(this.collection)
            .orderBy(orderBy, orderDirection)
            .offset(offset)
            .limit(limit)
            .get();
        const items = snapshot.docs.map((doc) => this.fromFirestore(doc));
        const totalPages = Math.ceil(total / limit);
        return {
            items,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }
    /**
     * Find all documents matching a simple field query.
     */
    async findByField(field, value, orderBy = 'createdAt', orderDirection = 'desc', limit) {
        let query = this.collection.where(field, '==', value).orderBy(orderBy, orderDirection);
        if (limit) {
            query = query.limit(limit);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => this.fromFirestore(doc));
    }
    /**
     * Batch create multiple documents.
     */
    async batchCreate(entities) {
        const batch = this.db.batch();
        for (const entity of entities) {
            const ref = this.collection.doc(entity.id);
            batch.set(ref, this.toFirestore(entity));
        }
        await batch.commit();
    }
    /**
     * Listen to real-time changes on a document.
     * Returns an unsubscribe function.
     */
    onSnapshot(id, callback, onError) {
        return this.collection.doc(id).onSnapshot((doc) => {
            if (doc.exists) {
                callback(this.fromFirestore(doc));
            }
            else {
                callback(null);
            }
        }, (error) => {
            onError?.(error);
        });
    }
}
//# sourceMappingURL=base.repository.js.map