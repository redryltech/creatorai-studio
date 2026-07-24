// ============================================================
// CreatorAI Studio — Project Repository
// ============================================================

import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { Project, Scene, Asset, ProjectOutput } from '@creatorai/shared';
import { ProjectStatus } from '@creatorai/shared';
import { COLLECTIONS } from '../collections';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';

export class ProjectRepository extends BaseRepository<Project> {
  constructor(db: Firestore) {
    super(db, COLLECTIONS.PROJECTS);
  }

  protected fromFirestore(doc: DocumentSnapshot): Project {
    const data = doc.data()!;
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

  protected toFirestore(entity: Partial<Project>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };

    // Remove the id field — it's the document ID, not a field
    delete data.id;

    // Convert Date fields to Firestore Timestamps
    if (entity.createdAt) data.createdAt = entity.createdAt;
    if (entity.updatedAt) data.updatedAt = entity.updatedAt;
    if (entity.deletedAt) data.deletedAt = entity.deletedAt;

    return data;
  }

  /**
   * Find all projects for a user with pagination.
   */
  async findByUser(
    userId: string,
    options: PaginationOptions & { status?: ProjectStatus; contentType?: string },
  ): Promise<PaginatedResult<Project>> {
    return this.findPaginated(
      (ref) => {
        let query = ref.where('userId', '==', userId).where('deletedAt', '==', null);

        if (options.status) {
          query = query.where('status', '==', options.status);
        }
        if (options.contentType) {
          query = query.where('contentType', '==', options.contentType);
        }

        return query;
      },
      options,
    );
  }

  /**
   * Update project status.
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<void> {
    await this.update(projectId, { status } as Partial<Project>);
  }

  /**
   * Set the pipeline ID for a project.
   */
  async setPipeline(projectId: string, pipelineId: string): Promise<void> {
    await this.collection.doc(projectId).update({
      pipelineId,
      status: ProjectStatus.PROCESSING,
      updatedAt: new Date(),
    });
  }

  // ---- Scene Operations ----

  private scenesCollection(projectId: string) {
    return this.collection.doc(projectId).collection(COLLECTIONS.SCENES);
  }

  async createScene(projectId: string, scene: Scene): Promise<Scene> {
    await this.scenesCollection(projectId).doc(scene.id).set({
      ...scene,
      projectId,
    });
    return scene;
  }

  async createScenes(projectId: string, scenes: Scene[]): Promise<void> {
    const batch = this.db.batch();
    for (const scene of scenes) {
      const ref = this.scenesCollection(projectId).doc(scene.id);
      batch.set(ref, { ...scene, projectId });
    }
    await batch.commit();
  }

  async getScenes(projectId: string): Promise<Scene[]> {
    const snapshot = await this.scenesCollection(projectId)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      } as Scene;
    });
  }

  async updateScene(projectId: string, sceneId: string, updates: Partial<Scene>): Promise<void> {
    const data = { ...updates } as Record<string, unknown>;
    delete data.id;
    delete data.projectId;
    await this.scenesCollection(projectId).doc(sceneId).update(data);
  }

  // ---- Asset Operations ----

  private assetsCollection(projectId: string) {
    return this.collection.doc(projectId).collection(COLLECTIONS.ASSETS);
  }

  async createAsset(projectId: string, asset: Asset): Promise<Asset> {
    await this.assetsCollection(projectId).doc(asset.id).set({
      ...asset,
      projectId,
    });
    return asset;
  }

  async getAssets(projectId: string, type?: string): Promise<Asset[]> {
    let query = this.assetsCollection(projectId).orderBy('createdAt', 'desc');
    if (type) {
      query = this.assetsCollection(projectId)
        .where('type', '==', type)
        .orderBy('createdAt', 'desc') as typeof query;
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      } as Asset;
    });
  }

  // ---- Output Operations ----

  private outputsCollection(projectId: string) {
    return this.collection.doc(projectId).collection(COLLECTIONS.OUTPUTS);
  }

  async createOutput(projectId: string, output: ProjectOutput): Promise<ProjectOutput> {
    await this.outputsCollection(projectId).doc(output.id).set({
      ...output,
      projectId,
    });
    return output;
  }

  async getOutputs(projectId: string): Promise<ProjectOutput[]> {
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
      } as ProjectOutput;
    });
  }

  async updateOutput(
    projectId: string,
    outputId: string,
    updates: Partial<ProjectOutput>,
  ): Promise<void> {
    const data = { ...updates } as Record<string, unknown>;
    delete data.id;
    delete data.projectId;
    await this.outputsCollection(projectId).doc(outputId).update(data);
  }
}
