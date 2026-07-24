import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { Pipeline, PipelineStep } from '@creatorai/shared';
import { PipelineStatus } from '@creatorai/shared';
import { BaseRepository } from './base.repository';
export declare class PipelineRepository extends BaseRepository<Pipeline> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): Pipeline;
    protected toFirestore(entity: Partial<Pipeline>): Record<string, unknown>;
    /**
     * Find active pipelines for a user.
     */
    findActiveByUser(userId: string): Promise<Pipeline[]>;
    /**
     * Find pipeline for a project.
     */
    findByProject(projectId: string): Promise<Pipeline | null>;
    /**
     * Update pipeline status.
     */
    updateStatus(pipelineId: string, status: PipelineStatus): Promise<void>;
    /**
     * Update pipeline progress.
     */
    updateProgress(pipelineId: string, progress: number, currentStep: string | null): Promise<void>;
    /**
     * Update a specific step in the pipeline plan.
     */
    updateStep(pipelineId: string, stepIndex: number, stepUpdate: Partial<PipelineStep>): Promise<void>;
    /**
     * Mark a step as started.
     */
    markStepStarted(pipelineId: string, stepId: string): Promise<void>;
    /**
     * Mark a step as completed with output.
     */
    markStepCompleted(pipelineId: string, stepId: string, output: Record<string, unknown>): Promise<void>;
    /**
     * Mark a step as failed.
     */
    markStepFailed(pipelineId: string, stepId: string, error: {
        code: string;
        message: string;
        retryable: boolean;
    }): Promise<void>;
    /**
     * Calculate overall pipeline progress based on completed steps.
     */
    private calculateProgress;
}
//# sourceMappingURL=pipeline.repository.d.ts.map