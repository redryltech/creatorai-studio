// ============================================================
// CreatorAI Studio — Job Queue
// ============================================================
// In-process job queue for long-running AI operations.
//
// Architecture decision:
// We start with an in-process queue instead of Redis/BullMQ because:
// 1. Fewer infrastructure dependencies during early development
// 2. Simpler deployment (single Vercel/Cloud Run instance)
// 3. The queue interface is identical — swap to BullMQ by implementing
//    the same IJobQueue interface with a Redis-backed class.
//
// When to migrate to Redis-backed queue:
// - When we need horizontal scaling (multiple server instances)
// - When job persistence across server restarts is critical
// - When we need delayed/scheduled jobs with precision
//
// The queue processes jobs with concurrency control and priority ordering.
// ============================================================

import type { Job } from '@creatorai/shared';
import { JobStatus, generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '../logger';

const log = Logger.for('JobQueue');

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

const DEFAULT_CONFIG: JobQueueConfig = {
  concurrency: 3,
  defaultMaxAttempts: 3,
  defaultExpiryMs: 30 * 60 * 1000, // 30 minutes
  pollIntervalMs: 1000,
};

/**
 * In-process job queue with priority ordering and concurrency control.
 */
export class JobQueue {
  private static instance: JobQueue | null = null;
  private readonly config: JobQueueConfig;
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private activeJobs: Set<string> = new Set();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Map<string, JobEventListener[]> = new Map();

  private constructor(config: Partial<JobQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<JobQueueConfig>): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue(config);
    }
    return JobQueue.instance;
  }

  static resetInstance(): void {
    if (JobQueue.instance?.pollTimer) {
      clearInterval(JobQueue.instance.pollTimer);
    }
    JobQueue.instance = null;
  }

  /**
   * Register a handler for a specific job type.
   */
  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
    log.info('Registered job handler', { jobType });
  }

  /**
   * Start processing jobs.
   */
  start(): void {
    if (this.pollTimer) return;

    this.pollTimer = setInterval(() => {
      this.processNext().catch((error) => {
        log.error('Job processing error', {}, error as Error);
      });
    }, this.config.pollIntervalMs);

    log.info('Job queue started', {
      concurrency: this.config.concurrency,
      pollIntervalMs: this.config.pollIntervalMs,
    });
  }

  /**
   * Stop processing jobs (gracefully — waits for active jobs to complete).
   */
  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    log.info('Job queue stopped', { activeJobs: this.activeJobs.size });
  }

  /**
   * Enqueue a new job.
   */
  async enqueue(params: {
    type: string;
    userId: string;
    projectId?: string | null;
    pipelineId?: string | null;
    agentId: string;
    input: Record<string, unknown>;
    priority?: number;
    maxAttempts?: number;
  }): Promise<Job> {
    const job: Job = {
      id: generateId(ID_PREFIXES.step),
      type: params.type as any,
      status: JobStatus.PENDING,
      userId: params.userId,
      projectId: params.projectId ?? null,
      pipelineId: params.pipelineId ?? null,
      agentId: params.agentId,
      priority: params.priority ?? 10,
      input: params.input,
      output: null,
      error: null,
      progress: 0,
      attempts: 0,
      maxAttempts: params.maxAttempts ?? this.config.defaultMaxAttempts,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      expiresAt: new Date(Date.now() + this.config.defaultExpiryMs),
    };

    this.jobs.set(job.id, job);
    this.emit('job.created', job);

    log.info('Job enqueued', {
      jobId: job.id,
      type: job.type,
      userId: job.userId,
      priority: job.priority,
      queueSize: this.pendingCount,
    });

    return job;
  }

  /**
   * Get a job by ID.
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancel a job.
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === JobStatus.PENDING || job.status === JobStatus.QUEUED) {
      job.status = JobStatus.CANCELLED;
      job.completedAt = new Date();
      this.emit('job.cancelled', job);
      return true;
    }

    // Can't cancel a job that's already processing
    return false;
  }

  /**
   * Update job progress (called by handlers during execution).
   */
  updateProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress));
      this.emit('job.progress', job);
    }
  }

  /**
   * Get pending job count.
   */
  get pendingCount(): number {
    return Array.from(this.jobs.values()).filter(
      (j) => j.status === JobStatus.PENDING || j.status === JobStatus.QUEUED,
    ).length;
  }

  /**
   * Get active (processing) job count.
   */
  get activeCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Subscribe to job events.
   */
  on(event: string, listener: JobEventListener): () => void {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  /**
   * Get all jobs for a user.
   */
  getUserJobs(userId: string, status?: string): Job[] {
    return Array.from(this.jobs.values())
      .filter((j) => j.userId === userId && (!status || j.status === status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clean up expired/completed jobs to free memory.
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [id, job] of this.jobs.entries()) {
      // Remove completed/failed jobs older than 1 hour
      if (
        (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED || job.status === JobStatus.CANCELLED) &&
        job.completedAt &&
        now - job.completedAt.getTime() > 3600000
      ) {
        this.jobs.delete(id);
        removed++;
      }

      // Remove expired pending jobs
      if (job.status === JobStatus.PENDING && now > job.expiresAt.getTime()) {
        job.status = JobStatus.FAILED;
        job.error = { code: 'EXPIRED', message: 'Job expired before processing', retryable: false };
        job.completedAt = new Date();
        this.emit('job.failed', job);
        this.jobs.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      log.debug('Cleaned up expired jobs', { removed, remaining: this.jobs.size });
    }

    return removed;
  }

  // ---- Private ----

  /**
   * Process the next available job.
   */
  private async processNext(): Promise<void> {
    // Check concurrency limit
    if (this.activeJobs.size >= this.config.concurrency) return;

    // Find the highest-priority pending job
    const nextJob = this.getNextJob();
    if (!nextJob) return;

    // Check if we have a handler
    const handler = this.handlers.get(nextJob.type);
    if (!handler) {
      log.warn('No handler registered for job type', {
        jobType: nextJob.type,
        jobId: nextJob.id,
      });
      nextJob.status = JobStatus.FAILED;
      nextJob.error = { code: 'NO_HANDLER', message: `No handler for job type: ${nextJob.type}`, retryable: false };
      nextJob.completedAt = new Date();
      this.emit('job.failed', nextJob);
      return;
    }

    // Start processing
    nextJob.status = JobStatus.PROCESSING;
    nextJob.startedAt = new Date();
    nextJob.attempts++;
    this.activeJobs.add(nextJob.id);
    this.emit('job.started', nextJob);

    log.info('Processing job', {
      jobId: nextJob.id,
      type: nextJob.type,
      attempt: nextJob.attempts,
      maxAttempts: nextJob.maxAttempts,
    });

    try {
      const result = await handler(nextJob);

      nextJob.status = JobStatus.COMPLETED;
      nextJob.output = result.output;
      nextJob.progress = 100;
      nextJob.completedAt = new Date();
      this.emit('job.completed', nextJob);

      log.info('Job completed', {
        jobId: nextJob.id,
        type: nextJob.type,
        durationMs: nextJob.completedAt.getTime() - (nextJob.startedAt?.getTime() ?? 0),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const retryable = nextJob.attempts < nextJob.maxAttempts;

      if (retryable) {
        nextJob.status = JobStatus.PENDING; // Re-queue
        nextJob.error = { code: 'PROCESSING_ERROR', message: errorMsg, retryable: true };
        this.emit('job.retrying', nextJob);
        log.warn('Job failed, will retry', {
          jobId: nextJob.id,
          attempt: nextJob.attempts,
          maxAttempts: nextJob.maxAttempts,
          error: errorMsg,
        });
      } else {
        nextJob.status = JobStatus.FAILED;
        nextJob.error = { code: 'PROCESSING_ERROR', message: errorMsg, retryable: false };
        nextJob.completedAt = new Date();
        this.emit('job.failed', nextJob);
        log.error('Job permanently failed', {
          jobId: nextJob.id,
          attempts: nextJob.attempts,
        }, error instanceof Error ? error : undefined);
      }
    } finally {
      this.activeJobs.delete(nextJob.id);
    }
  }

  /**
   * Get the next job to process (highest priority, oldest first).
   */
  private getNextJob(): Job | undefined {
    const pending = Array.from(this.jobs.values())
      .filter((j) => j.status === JobStatus.PENDING)
      .sort((a, b) => {
        // Priority first (lower = higher priority)
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Then by creation time (FIFO)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return pending[0];
  }

  private emit(event: string, job: Job): void {
    const listeners = this.eventListeners.get(event) ?? [];
    for (const listener of listeners) {
      try {
        listener(job);
      } catch (error) {
        log.error('Job event listener error', { event }, error as Error);
      }
    }
  }
}
