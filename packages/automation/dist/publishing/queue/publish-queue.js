// ============================================================
// CreatorAI Studio — Publish Queue
// ============================================================
import { generateId, ID_PREFIXES, sleep } from '@creatorai/shared';
import { Logger, SSEManager } from '@creatorai/agents';
import { PublisherRegistry } from '../registry/publisher-registry';
const log = Logger.for('PublishQueue');
export class PublishQueue {
    static instance = null;
    jobs = new Map();
    accounts = new Map();
    processing = false;
    maxConcurrency = 2;
    constructor() { }
    static getInstance() { if (!PublishQueue.instance)
        PublishQueue.instance = new PublishQueue(); return PublishQueue.instance; }
    static resetInstance() { PublishQueue.instance = null; }
    /** Register a social account for publishing. */
    registerAccount(account) {
        this.accounts.set(account.id, account);
        log.info('Social account registered', { platform: account.platform, name: account.accountName });
    }
    /** Enqueue a publish job. */
    enqueue(request, userId, projectId, workflowId, priority = 10) {
        const job = {
            id: generateId(ID_PREFIXES.step),
            request, userId, projectId, workflowId,
            status: 'queued', progress: 0, priority,
            attempts: 0, maxAttempts: 3, error: null, result: null,
            createdAt: new Date(), startedAt: null, completedAt: null,
        };
        this.jobs.set(job.id, job);
        log.info('Publish job enqueued', { jobId: job.id, platform: request.platform, priority });
        if (!this.processing)
            this.startProcessing();
        return job;
    }
    /** Get a job by ID. */
    getJob(jobId) { return this.jobs.get(jobId); }
    /** Get all jobs for a user. */
    getUserJobs(userId) {
        return Array.from(this.jobs.values())
            .filter((j) => j.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /** Cancel a queued job. */
    cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || job.status !== 'queued')
            return false;
        job.status = 'cancelled';
        job.completedAt = new Date();
        return true;
    }
    get pendingCount() { return Array.from(this.jobs.values()).filter((j) => j.status === 'queued').length; }
    get activeCount() { return Array.from(this.jobs.values()).filter((j) => j.status === 'uploading' || j.status === 'processing').length; }
    // ---- Processing Loop ----
    async startProcessing() {
        if (this.processing)
            return;
        this.processing = true;
        while (true) {
            const pending = Array.from(this.jobs.values())
                .filter((j) => j.status === 'queued')
                .sort((a, b) => a.priority - b.priority || a.createdAt.getTime() - b.createdAt.getTime());
            if (pending.length === 0) {
                this.processing = false;
                return;
            }
            if (this.activeCount >= this.maxConcurrency) {
                await sleep(1000);
                continue;
            }
            const job = pending[0];
            this.processJob(job).catch((err) => log.error('Publish job error', { jobId: job.id }, err));
        }
    }
    async processJob(job) {
        const account = this.accounts.get(job.request.accountId);
        if (!account) {
            job.status = 'failed';
            job.error = 'Social account not found';
            job.completedAt = new Date();
            return;
        }
        const publisher = PublisherRegistry.getInstance().get(job.request.platform);
        if (!publisher) {
            job.status = 'failed';
            job.error = `No publisher for platform: ${job.request.platform}`;
            job.completedAt = new Date();
            return;
        }
        const sse = SSEManager.getInstance();
        for (let attempt = 1; attempt <= job.maxAttempts; attempt++) {
            try {
                job.attempts = attempt;
                job.startedAt = new Date();
                job.status = 'uploading';
                sse.sendToUser(job.userId, 'publish.started', { jobId: job.id, platform: job.request.platform, attempt });
                const result = await publisher.upload(job.request, account, (progress, message) => {
                    job.progress = progress;
                    sse.sendToUser(job.userId, 'publish.progress', { jobId: job.id, progress, message });
                });
                job.status = 'published';
                job.result = result;
                job.completedAt = new Date();
                job.progress = 100;
                sse.sendToUser(job.userId, 'publish.completed', {
                    jobId: job.id, platform: job.request.platform,
                    url: result.platformUrl, postId: result.platformPostId,
                });
                log.info('Publish complete', { jobId: job.id, platform: job.request.platform, url: result.platformUrl });
                return;
            }
            catch (error) {
                job.error = error.message;
                if (attempt >= job.maxAttempts) {
                    job.status = 'failed';
                    job.completedAt = new Date();
                    sse.sendToUser(job.userId, 'publish.failed', { jobId: job.id, error: job.error });
                    log.error('Publish permanently failed', { jobId: job.id, attempts: attempt });
                    return;
                }
                log.warn('Publish attempt failed, retrying', { jobId: job.id, attempt });
                await sleep(3000 * attempt);
            }
        }
    }
}
//# sourceMappingURL=publish-queue.js.map