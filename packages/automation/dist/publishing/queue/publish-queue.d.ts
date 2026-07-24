import type { PublishJob, PublishRequest, SocialAccount } from '../types/publishing.types';
export declare class PublishQueue {
    private static instance;
    private jobs;
    private accounts;
    private processing;
    private maxConcurrency;
    private constructor();
    static getInstance(): PublishQueue;
    static resetInstance(): void;
    /** Register a social account for publishing. */
    registerAccount(account: SocialAccount): void;
    /** Enqueue a publish job. */
    enqueue(request: PublishRequest, userId: string, projectId: string, workflowId: string, priority?: number): PublishJob;
    /** Get a job by ID. */
    getJob(jobId: string): PublishJob | undefined;
    /** Get all jobs for a user. */
    getUserJobs(userId: string): PublishJob[];
    /** Cancel a queued job. */
    cancelJob(jobId: string): boolean;
    get pendingCount(): number;
    get activeCount(): number;
    private startProcessing;
    private processJob;
}
//# sourceMappingURL=publish-queue.d.ts.map