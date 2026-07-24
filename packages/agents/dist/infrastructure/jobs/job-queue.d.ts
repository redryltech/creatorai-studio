import type { Job } from '@creatorai/shared';
/**
 * Job handler — the function that processes a job.
 */
export type JobHandler = (job: Job) => Promise<{
    output: Record<string, unknown>;
}>;
/**
 * Job event listener.
 */
export type JobEventListener = (job: Job) => void;
/**
 * Job queue configuration.
 */
export interface JobQueueConfig {
    /** Maximum concurrent jobs */
    concurrency: number;
    /** Default max retry attempts */
    defaultMaxAttempts: number;
    /** Default job expiry time (ms) */
    defaultExpiryMs: number;
    /** How often to poll for processable jobs (ms) */
    pollIntervalMs: number;
}
/**
 * In-process job queue with priority ordering and concurrency control.
 */
export declare class JobQueue {
    private static instance;
    private readonly config;
    private jobs;
    private handlers;
    private activeJobs;
    private pollTimer;
    private eventListeners;
    private constructor();
    static getInstance(config?: Partial<JobQueueConfig>): JobQueue;
    static resetInstance(): void;
    /**
     * Register a handler for a specific job type.
     */
    registerHandler(jobType: string, handler: JobHandler): void;
    /**
     * Start processing jobs.
     */
    start(): void;
    /**
     * Stop processing jobs (gracefully — waits for active jobs to complete).
     */
    stop(): void;
    /**
     * Enqueue a new job.
     */
    enqueue(params: {
        type: string;
        userId: string;
        projectId?: string | null;
        pipelineId?: string | null;
        agentId: string;
        input: Record<string, unknown>;
        priority?: number;
        maxAttempts?: number;
    }): Promise<Job>;
    /**
     * Get a job by ID.
     */
    getJob(jobId: string): Job | undefined;
    /**
     * Cancel a job.
     */
    cancelJob(jobId: string): Promise<boolean>;
    /**
     * Update job progress (called by handlers during execution).
     */
    updateProgress(jobId: string, progress: number): void;
    /**
     * Get pending job count.
     */
    get pendingCount(): number;
    /**
     * Get active (processing) job count.
     */
    get activeCount(): number;
    /**
     * Subscribe to job events.
     */
    on(event: string, listener: JobEventListener): () => void;
    /**
     * Get all jobs for a user.
     */
    getUserJobs(userId: string, status?: string): Job[];
    /**
     * Clean up expired/completed jobs to free memory.
     */
    cleanup(): number;
    /**
     * Process the next available job.
     */
    private processNext;
    /**
     * Get the next job to process (highest priority, oldest first).
     */
    private getNextJob;
    private emit;
}
//# sourceMappingURL=job-queue.d.ts.map