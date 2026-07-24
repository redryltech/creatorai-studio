import type { Artifact } from './artifact.types';
import { ArtifactType } from './artifact.types';
export declare class ArtifactManager {
    /**
     * In-memory artifact store.
     * In production, this is backed by Firestore via the repository.
     * The in-memory layer acts as a write-through cache for the
     * current workflow execution.
     */
    private artifacts;
    /**
     * Index: nodeId → artifact IDs produced by that node.
     * Used by the Executor to resolve artifact references.
     */
    private nodeIndex;
    /**
     * Store a new artifact.
     *
     * @returns The created Artifact with a generated ID
     */
    store(params: {
        nodeId: string;
        workflowRunId: string;
        projectId: string;
        userId: string;
        type: ArtifactType;
        data: Record<string, unknown>;
        storageRef?: string;
        url?: string;
        sourceAgentId: string;
        sizeBytes?: number;
        metadata?: Record<string, unknown>;
    }): Artifact;
    /**
     * Get an artifact by ID.
     */
    getById(artifactId: string): Artifact | undefined;
    /**
     * Get all artifacts produced by a specific node.
     */
    getByNode(nodeId: string): Artifact[];
    /**
     * Get the first artifact of a specific type from a node.
     */
    getByNodeAndType(nodeId: string, type: ArtifactType): Artifact | undefined;
    /**
     * Resolve an artifact data path.
     *
     * Path format: "{nodeId}.{dataField}" or "{nodeId}.{dataField}.{subField}"
     * Example: "item-0-script.scenes" → gets the `scenes` field from
     *          the script artifact produced by node "item-0-script"
     *
     * This is the key integration point between the Planner's
     * WorkflowInputMapping and runtime data resolution.
     */
    resolve(path: string): unknown;
    /**
     * Get all artifacts for a workflow run.
     */
    getByWorkflowRun(workflowRunId: string): Artifact[];
    /**
     * Get all artifacts for a project.
     */
    getByProject(projectId: string): Artifact[];
    /**
     * Mark an artifact as failed.
     */
    markFailed(artifactId: string, error: string): void;
    /**
     * Get artifact count.
     */
    get size(): number;
    /**
     * Export all artifacts as a flat array (for persistence to Firestore).
     */
    exportAll(): Artifact[];
    /**
     * Clear all artifacts (used between workflow runs in tests).
     */
    clear(): void;
    private computeChecksum;
}
//# sourceMappingURL=artifact-manager.d.ts.map