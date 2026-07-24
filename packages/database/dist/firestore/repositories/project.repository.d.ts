import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { Project, Scene, Asset, ProjectOutput } from '@creatorai/shared';
import { ProjectStatus } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
export declare class ProjectRepository extends BaseRepository<Project> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): Project;
    protected toFirestore(entity: Partial<Project>): Record<string, unknown>;
    /**
     * Find all projects for a user with pagination.
     */
    findByUser(userId: string, options: PaginationOptions & {
        status?: ProjectStatus;
        contentType?: string;
    }): Promise<PaginatedResult<Project>>;
    /**
     * Update project status.
     */
    updateStatus(projectId: string, status: ProjectStatus): Promise<void>;
    /**
     * Set the pipeline ID for a project.
     */
    setPipeline(projectId: string, pipelineId: string): Promise<void>;
    private scenesCollection;
    createScene(projectId: string, scene: Scene): Promise<Scene>;
    createScenes(projectId: string, scenes: Scene[]): Promise<void>;
    getScenes(projectId: string): Promise<Scene[]>;
    updateScene(projectId: string, sceneId: string, updates: Partial<Scene>): Promise<void>;
    private assetsCollection;
    createAsset(projectId: string, asset: Asset): Promise<Asset>;
    getAssets(projectId: string, type?: string): Promise<Asset[]>;
    private outputsCollection;
    createOutput(projectId: string, output: ProjectOutput): Promise<ProjectOutput>;
    getOutputs(projectId: string): Promise<ProjectOutput[]>;
    updateOutput(projectId: string, outputId: string, updates: Partial<ProjectOutput>): Promise<void>;
}
//# sourceMappingURL=project.repository.d.ts.map