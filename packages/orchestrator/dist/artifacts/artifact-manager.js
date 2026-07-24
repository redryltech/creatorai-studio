// ============================================================
// CreatorAI Studio — Artifact Manager
// ============================================================
// Central service for creating, retrieving, and managing
// artifacts produced during workflow execution.
//
// The Executor calls artifactManager.store() after each node
// completes. Downstream nodes call artifactManager.resolve()
// to get data from upstream nodes.
//
// Storage strategy:
// - JSON artifacts (scripts, prompts, SEO): stored inline in
//   Firestore document `data` field
// - Binary artifacts (images, audio, video): stored in
//   Firebase Storage, referenced by `storageRef` + `url`
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { ArtifactStatus } from './artifact.types';
import { createHash } from 'crypto';
const log = Logger.for('ArtifactManager');
export class ArtifactManager {
    /**
     * In-memory artifact store.
     * In production, this is backed by Firestore via the repository.
     * The in-memory layer acts as a write-through cache for the
     * current workflow execution.
     */
    artifacts = new Map();
    /**
     * Index: nodeId → artifact IDs produced by that node.
     * Used by the Executor to resolve artifact references.
     */
    nodeIndex = new Map();
    /**
     * Store a new artifact.
     *
     * @returns The created Artifact with a generated ID
     */
    store(params) {
        const id = generateId(ID_PREFIXES.asset);
        const artifact = {
            id,
            nodeId: params.nodeId,
            workflowRunId: params.workflowRunId,
            projectId: params.projectId,
            userId: params.userId,
            type: params.type,
            status: ArtifactStatus.READY,
            data: params.data,
            storageRef: params.storageRef ?? null,
            url: params.url ?? null,
            sourceAgentId: params.sourceAgentId,
            checksum: this.computeChecksum(params.data),
            sizeBytes: params.sizeBytes ?? null,
            version: 1,
            metadata: params.metadata ?? {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.artifacts.set(id, artifact);
        // Update node index
        const nodeArtifacts = this.nodeIndex.get(params.nodeId) ?? [];
        nodeArtifacts.push(id);
        this.nodeIndex.set(params.nodeId, nodeArtifacts);
        log.debug('Artifact stored', {
            artifactId: id,
            nodeId: params.nodeId,
            type: params.type,
            agentId: params.sourceAgentId,
        });
        return artifact;
    }
    /**
     * Get an artifact by ID.
     */
    getById(artifactId) {
        return this.artifacts.get(artifactId);
    }
    /**
     * Get all artifacts produced by a specific node.
     */
    getByNode(nodeId) {
        const ids = this.nodeIndex.get(nodeId) ?? [];
        return ids.map((id) => this.artifacts.get(id)).filter(Boolean);
    }
    /**
     * Get the first artifact of a specific type from a node.
     */
    getByNodeAndType(nodeId, type) {
        return this.getByNode(nodeId).find((a) => a.type === type);
    }
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
    resolve(path) {
        const parts = path.split('.');
        if (parts.length < 2) {
            log.warn('Invalid artifact path — expected "nodeId.field"', { path });
            return undefined;
        }
        const nodeId = parts[0];
        const fieldPath = parts.slice(1);
        // Find the primary artifact for this node
        const artifacts = this.getByNode(nodeId);
        if (artifacts.length === 0) {
            log.warn('No artifacts found for node', { nodeId, path });
            return undefined;
        }
        // Use the first ready artifact
        const artifact = artifacts.find((a) => a.status === ArtifactStatus.READY) ?? artifacts[0];
        // Traverse the data object by field path
        let current = artifact.data;
        for (const field of fieldPath) {
            if (current === null || current === undefined)
                return undefined;
            if (typeof current === 'object') {
                current = current[field];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    /**
     * Get all artifacts for a workflow run.
     */
    getByWorkflowRun(workflowRunId) {
        return Array.from(this.artifacts.values())
            .filter((a) => a.workflowRunId === workflowRunId);
    }
    /**
     * Get all artifacts for a project.
     */
    getByProject(projectId) {
        return Array.from(this.artifacts.values())
            .filter((a) => a.projectId === projectId);
    }
    /**
     * Mark an artifact as failed.
     */
    markFailed(artifactId, error) {
        const artifact = this.artifacts.get(artifactId);
        if (artifact) {
            artifact.status = ArtifactStatus.FAILED;
            artifact.metadata.error = error;
            artifact.updatedAt = new Date();
        }
    }
    /**
     * Get artifact count.
     */
    get size() {
        return this.artifacts.size;
    }
    /**
     * Export all artifacts as a flat array (for persistence to Firestore).
     */
    exportAll() {
        return Array.from(this.artifacts.values());
    }
    /**
     * Clear all artifacts (used between workflow runs in tests).
     */
    clear() {
        this.artifacts.clear();
        this.nodeIndex.clear();
    }
    // ---- Private ----
    computeChecksum(data) {
        try {
            const json = JSON.stringify(data);
            return createHash('sha256').update(json).digest('hex').slice(0, 16);
        }
        catch {
            return 'unknown';
        }
    }
}
//# sourceMappingURL=artifact-manager.js.map