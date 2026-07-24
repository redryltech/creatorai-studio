// ============================================================
// CreatorAI Studio — Project Repository
// ============================================================
import { ProjectStatus } from '@creatorai/shared';
import { COLLECTIONS } from '../collections';
import { BaseRepository } from './base.repository';
export class ProjectRepository extends BaseRepository {
    constructor(db) {
        super(db, COLLECTIONS.PROJECTS);
    }
    fromFirestore(doc) {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description ?? '',
            status: data.status,
            contentType: data.contentType,
            targetPlatforms: data.targetPlatforms ?? [],
            originalPrompt: data.originalPrompt ?? '',
            settings: data.settings,
            pipelineId: data.pipelineId ?? null,
            script: data.script ?? null,
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
            deletedAt: data.deletedAt?.toDate() ?? null,
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        // Remove the id field — it's the document ID, not a field
        delete data.id;
        // Convert Date fields to Firestore Timestamps
        if (entity.createdAt)
            data.createdAt = entity.createdAt;
        if (entity.updatedAt)
            data.updatedAt = entity.updatedAt;
        if (entity.deletedAt)
            data.deletedAt = entity.deletedAt;
        return data;
    }
    /**
     * Find all projects for a user with pagination.
     */
    async findByUser(userId, options) {
        return this.findPaginated((ref) => {
            let query = ref.where('userId', '==', userId).where('deletedAt', '==', null);
            if (options.status) {
                query = query.where('status', '==', options.status);
            }
            if (options.contentType) {
                query = query.where('contentType', '==', options.contentType);
            }
            return query;
        }, options);
    }
    /**
     * Update project status.
     */
    async updateStatus(projectId, status) {
        await this.update(projectId, { status });
    }
    /**
     * Set the pipeline ID for a project.
     */
    async setPipeline(projectId, pipelineId) {
        await this.collection.doc(projectId).update({
            pipelineId,
            status: ProjectStatus.PROCESSING,
            updatedAt: new Date(),
        });
    }
    // ---- Scene Operations ----
    scenesCollection(projectId) {
        return this.collection.doc(projectId).collection(COLLECTIONS.SCENES);
    }
    async createScene(projectId, scene) {
        await this.scenesCollection(projectId).doc(scene.id).set({
            ...scene,
            projectId,
        });
        return scene;
    }
    async createScenes(projectId, scenes) {
        const batch = this.db.batch();
        for (const scene of scenes) {
            const ref = this.scenesCollection(projectId).doc(scene.id);
            batch.set(ref, { ...scene, projectId });
        }
        await batch.commit();
    }
    async getScenes(projectId) {
        const snapshot = await this.scenesCollection(projectId)
            .orderBy('order', 'asc')
            .get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() ?? new Date(),
            };
        });
    }
    async updateScene(projectId, sceneId, updates) {
        const data = { ...updates };
        delete data.id;
        delete data.projectId;
        await this.scenesCollection(projectId).doc(sceneId).update(data);
    }
    // ---- Asset Operations ----
    assetsCollection(projectId) {
        return this.collection.doc(projectId).collection(COLLECTIONS.ASSETS);
    }
    async createAsset(projectId, asset) {
        await this.assetsCollection(projectId).doc(asset.id).set({
            ...asset,
            projectId,
        });
        return asset;
    }
    async getAssets(projectId, type) {
        let query = this.assetsCollection(projectId).orderBy('createdAt', 'desc');
        if (type) {
            query = this.assetsCollection(projectId)
                .where('type', '==', type)
                .orderBy('createdAt', 'desc');
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() ?? new Date(),
            };
        });
    }
    // ---- Output Operations ----
    outputsCollection(projectId) {
        return this.collection.doc(projectId).collection(COLLECTIONS.OUTPUTS);
    }
    async createOutput(projectId, output) {
        await this.outputsCollection(projectId).doc(output.id).set({
            ...output,
            projectId,
        });
        return output;
    }
    async getOutputs(projectId) {
        const snapshot = await this.outputsCollection(projectId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() ?? new Date(),
                scheduledAt: data.scheduledAt?.toDate() ?? null,
                publishedAt: data.publishedAt?.toDate() ?? null,
            };
        });
    }
    async updateOutput(projectId, outputId, updates) {
        const data = { ...updates };
        delete data.id;
        delete data.projectId;
        await this.outputsCollection(projectId).doc(outputId).update(data);
    }
}
//# sourceMappingURL=project.repository.js.map