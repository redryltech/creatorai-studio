// ============================================================
// CreatorAI Studio — Pipeline Repository
// ============================================================
import { PipelineStatus, StepStatus } from '@creatorai/shared';
import { COLLECTIONS } from '../collections';
import { BaseRepository } from './base.repository';
export class PipelineRepository extends BaseRepository {
    constructor(db) {
        super(db, COLLECTIONS.PIPELINES);
    }
    fromFirestore(doc) {
        const data = doc.data();
        return {
            id: doc.id,
            projectId: data.projectId,
            userId: data.userId,
            status: data.status,
            currentStep: data.currentStep ?? null,
            progress: data.progress ?? 0,
            plan: {
                steps: (data.plan?.steps ?? []).map((step) => ({
                    ...step,
                    startedAt: step.startedAt?.toDate?.() ?? null,
                    completedAt: step.completedAt?.toDate?.() ?? null,
                    error: step.error
                        ? {
                            ...step.error,
                            timestamp: step.error.timestamp?.toDate?.() ??
                                new Date(),
                        }
                        : null,
                })),
                metadata: data.plan?.metadata ?? {},
            },
            error: data.error
                ? {
                    message: data.error.message,
                    step: data.error.step,
                    timestamp: data.error.timestamp?.toDate() ?? new Date(),
                    code: data.error.code,
                }
                : null,
            startedAt: data.startedAt?.toDate() ?? new Date(),
            completedAt: data.completedAt?.toDate() ?? null,
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    /**
     * Find active pipelines for a user.
     */
    async findActiveByUser(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('status', 'in', [PipelineStatus.QUEUED, PipelineStatus.RUNNING, PipelineStatus.PAUSED])
            .orderBy('startedAt', 'desc')
            .get();
        return snapshot.docs.map((doc) => this.fromFirestore(doc));
    }
    /**
     * Find pipeline for a project.
     */
    async findByProject(projectId) {
        const snapshot = await this.collection
            .where('projectId', '==', projectId)
            .orderBy('startedAt', 'desc')
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return this.fromFirestore(snapshot.docs[0]);
    }
    /**
     * Update pipeline status.
     */
    async updateStatus(pipelineId, status) {
        const updates = {
            status,
            updatedAt: new Date(),
        };
        if (status === PipelineStatus.COMPLETED || status === PipelineStatus.FAILED) {
            updates.completedAt = new Date();
        }
        await this.collection.doc(pipelineId).update(updates);
    }
    /**
     * Update pipeline progress.
     */
    async updateProgress(pipelineId, progress, currentStep) {
        await this.collection.doc(pipelineId).update({
            progress,
            currentStep,
            updatedAt: new Date(),
        });
    }
    /**
     * Update a specific step in the pipeline plan.
     */
    async updateStep(pipelineId, stepIndex, stepUpdate) {
        // Read-modify-write for step updates
        // (Firestore doesn't support updating array elements by index directly)
        const pipeline = await this.findByIdOrThrow(pipelineId);
        const steps = [...pipeline.plan.steps];
        if (stepIndex < 0 || stepIndex >= steps.length) {
            throw new Error(`Step index ${stepIndex} out of bounds (${steps.length} steps)`);
        }
        steps[stepIndex] = {
            ...steps[stepIndex],
            ...stepUpdate,
        };
        await this.collection.doc(pipelineId).update({
            'plan.steps': steps,
            updatedAt: new Date(),
        });
    }
    /**
     * Mark a step as started.
     */
    async markStepStarted(pipelineId, stepId) {
        const pipeline = await this.findByIdOrThrow(pipelineId);
        const stepIndex = pipeline.plan.steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1)
            throw new Error(`Step ${stepId} not found`);
        await this.updateStep(pipelineId, stepIndex, {
            status: StepStatus.RUNNING,
            startedAt: new Date(),
        });
        await this.updateProgress(pipelineId, this.calculateProgress(pipeline, stepId), stepId);
    }
    /**
     * Mark a step as completed with output.
     */
    async markStepCompleted(pipelineId, stepId, output) {
        const pipeline = await this.findByIdOrThrow(pipelineId);
        const stepIndex = pipeline.plan.steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1)
            throw new Error(`Step ${stepId} not found`);
        const step = pipeline.plan.steps[stepIndex];
        const now = new Date();
        const startedAt = step.startedAt ?? now;
        const durationSec = (now.getTime() - startedAt.getTime()) / 1000;
        await this.updateStep(pipelineId, stepIndex, {
            status: StepStatus.COMPLETED,
            output,
            completedAt: now,
            actualDurationSec: durationSec,
            progress: 100,
        });
    }
    /**
     * Mark a step as failed.
     */
    async markStepFailed(pipelineId, stepId, error) {
        const pipeline = await this.findByIdOrThrow(pipelineId);
        const stepIndex = pipeline.plan.steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1)
            throw new Error(`Step ${stepId} not found`);
        const step = pipeline.plan.steps[stepIndex];
        await this.updateStep(pipelineId, stepIndex, {
            status: StepStatus.FAILED,
            error: {
                code: error.code,
                message: error.message,
                provider: null,
                retryable: error.retryable,
                timestamp: new Date(),
            },
            retryCount: step.retryCount + 1,
        });
    }
    /**
     * Calculate overall pipeline progress based on completed steps.
     */
    calculateProgress(pipeline, currentStepId) {
        const totalSteps = pipeline.plan.steps.length;
        if (totalSteps === 0)
            return 0;
        const completedSteps = pipeline.plan.steps.filter((s) => s.status === StepStatus.COMPLETED).length;
        // Current step counts as partially done
        const currentStepIndex = pipeline.plan.steps.findIndex((s) => s.id === currentStepId);
        const progressWithCurrent = currentStepIndex >= 0
            ? (completedSteps + 0.5) / totalSteps
            : completedSteps / totalSteps;
        return Math.round(progressWithCurrent * 100);
    }
}
//# sourceMappingURL=pipeline.repository.js.map