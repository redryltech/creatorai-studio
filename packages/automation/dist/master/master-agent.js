// ============================================================
// CreatorAI Studio — Master Agent
// ============================================================
// The Master Agent is the CEO of the AI company.
// It receives a user's goal, breaks it into tasks, assigns
// tasks to specialized agents, and tracks execution.
//
// The Master Agent NEVER generates content directly.
// It only coordinates.
//
// Flow:
//   AutomationRequest → Master Agent
//     → Research Agent (gather intelligence)
//     → Content Planner (create content plan)
//     → Script Planner (create script packages)
//     → (future: Media, Editing, SEO, Publishing agents)
//
// The Master Agent uses the AutomationRegistry to discover
// agents. It never imports agent implementations directly.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker, SSEManager } from '@creatorai/agents';
import { AutomationRegistry } from '../registry/automation-registry';
import { AutomationStage, TaskStatus } from '../types/automation.types';
const log = Logger.for('MasterAgent');
export class MasterAgent {
    registry;
    costTracker;
    sseManager;
    activeExecutions = new Map();
    constructor() {
        this.registry = AutomationRegistry.getInstance();
        this.costTracker = CostTracker.getInstance();
        this.sseManager = SSEManager.getInstance();
    }
    /**
     * Execute an automation request end-to-end.
     *
     * This is the main entry point. The Master Agent:
     * 1. Creates a plan
     * 2. Executes each stage sequentially
     * 3. Reports progress via SSE
     * 4. Handles retries and failures
     * 5. Returns the final result
     *
     * @param request — What the user wants
     * @param userId — Who's requesting
     * @param projectId — Where to store results
     * @returns Automation response with workflow ID
     */
    async executeAutomation(request, userId, projectId) {
        const executionId = generateId(ID_PREFIXES.pipeline);
        log.info('Automation started', {
            executionId,
            topic: request.topic,
            platform: request.platform,
            videoCount: request.videoCount,
            userId,
        });
        // ── 1. Build the automation plan ──
        const plan = this.buildPlan(request, executionId, userId, projectId);
        // ── 2. Set up cancellation ──
        let cancelled = false;
        const cancellation = { get isCancelled() { return cancelled; } };
        this.activeExecutions.set(executionId, { cancel: () => { cancelled = true; } });
        // ── 3. Emit plan created event ──
        this.emitEvent(userId, 'automation.started', {
            executionId,
            stages: plan.stages,
            taskCount: plan.taskCount,
            estimatedCostUsd: plan.estimatedCostUsd,
            estimatedDurationMinutes: plan.estimatedDurationMinutes,
        });
        // ── 4. Execute asynchronously ──
        this.executeWorkflow(plan, cancellation, userId).catch((error) => {
            log.error('Automation failed', { executionId }, error);
        }).finally(() => {
            this.activeExecutions.delete(executionId);
        });
        // ── 5. Return immediately ──
        return {
            planId: plan.id,
            workflowId: executionId,
            status: 'running',
            message: this.buildResponseMessage(request, plan),
            stages: plan.stages,
            estimatedCostUsd: plan.estimatedCostUsd,
            estimatedDurationMinutes: plan.estimatedDurationMinutes,
        };
    }
    /**
     * Cancel an active automation.
     */
    cancelAutomation(executionId) {
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            execution.cancel();
            log.info('Automation cancelled', { executionId });
            return true;
        }
        return false;
    }
    /**
     * Get active execution count.
     */
    get activeCount() {
        return this.activeExecutions.size;
    }
    // ================================================================
    // Plan Building
    // ================================================================
    buildPlan(request, executionId, userId, projectId) {
        // Determine which stages are needed based on the request
        const stages = [
            AutomationStage.RESEARCH,
            AutomationStage.PLANNING,
            AutomationStage.SCRIPTING,
            AutomationStage.PROMPT_OPTIMIZATION,
            AutomationStage.IMAGE_GENERATION,
            AutomationStage.VOICE_GENERATION,
            AutomationStage.VIDEO_GENERATION,
            AutomationStage.MUSIC_GENERATION,
        ];
        // Build tasks for each stage
        const tasks = [
            this.createTask('research', AutomationStage.RESEARCH, 'automation.research_intelligence', 'Research Intelligence', []),
            this.createTask('planning', AutomationStage.PLANNING, 'automation.planner', 'Create content plan', ['research']),
        ];
        // Per-video tasks: script → [NEW PLANNING PIPELINE] → prompts → [images + voice + video] parallel → music
        for (let i = 0; i < request.videoCount; i++) {
            const scriptId = `script-${i}`;
            const directorId = `director-${i}`;
            const storyboardId = `storyboard-${i}`;
            const characterId = `character-${i}`;
            const sceneGraphId = `scene-graph-${i}`;
            const worldStateId = `world-state-${i}`;
            const assetMemId = `asset-memory-${i}`;
            const imgIntelId = `image-intel-${i}`;
            const promptCompilerId = `prompt-compile-${i}`;
            const promptId = `prompt-${i}`;
            const imageId = `image-${i}`;
            const voiceId = `voice-${i}`;
            const videoId = `video-${i}`;
            // Script generation
            tasks.push(this.createTask(scriptId, AutomationStage.SCRIPTING, 'automation.script_planner', `Write script #${i + 1}`, ['planning']));
            // ── NEW: 8-stage planning pipeline ──
            tasks.push(this.createTask(directorId, AutomationStage.SCRIPTING, 'automation.director', `AI Director #${i + 1}`, [scriptId]));
            tasks.push(this.createTask(storyboardId, AutomationStage.SCRIPTING, 'automation.storyboard', `Storyboard #${i + 1}`, [directorId]));
            tasks.push(this.createTask(characterId, AutomationStage.SCRIPTING, 'automation.character', `Character consistency #${i + 1}`, [storyboardId]));
            tasks.push(this.createTask(sceneGraphId, AutomationStage.SCRIPTING, 'automation.scene_graph', `Scene graph #${i + 1}`, [storyboardId, characterId]));
            tasks.push(this.createTask(worldStateId, AutomationStage.SCRIPTING, 'automation.world_state', `World state #${i + 1}`, [sceneGraphId]));
            tasks.push(this.createTask(assetMemId, AutomationStage.PROMPT_OPTIMIZATION, 'automation.asset_memory', `Asset memory #${i + 1}`, [worldStateId]));
            tasks.push(this.createTask(imgIntelId, AutomationStage.PROMPT_OPTIMIZATION, 'automation.image_intelligence', `Image intelligence #${i + 1}`, [storyboardId, characterId]));
            tasks.push(this.createTask(promptCompilerId, AutomationStage.PROMPT_OPTIMIZATION, 'automation.prompt_compiler', `Prompt compiler #${i + 1}`, [imgIntelId, assetMemId]));
            // Prompt optimization (LLM-powered refinement)
            tasks.push(this.createTask(promptId, AutomationStage.PROMPT_OPTIMIZATION, 'automation.prompt_optimizer', `Optimize prompts #${i + 1}`, [scriptId, promptCompilerId]));
            // Media generation (can run in parallel)
            tasks.push(this.createTask(imageId, AutomationStage.IMAGE_GENERATION, 'automation.image_gen', `Generate images #${i + 1}`, [promptId]));
            tasks.push(this.createTask(voiceId, AutomationStage.VOICE_GENERATION, 'automation.voice_gen', `Generate voiceover #${i + 1}`, [scriptId]));
            tasks.push(this.createTask(videoId, AutomationStage.VIDEO_GENERATION, 'automation.video_gen', `Generate video clips #${i + 1}`, [promptId, imageId]));
        }
        // One music task for the entire batch
        tasks.push(this.createTask('music', AutomationStage.MUSIC_GENERATION, 'automation.music', 'Select background music', ['script-0']));
        // Per-video: video production pipeline (depends on media outputs)
        for (let i = 0; i < request.videoCount; i++) {
            const transId = `transitions-${i}`;
            const effectsId = `effects-${i}`;
            const timelineId = `timeline-${i}`;
            const captionsId = `captions-${i}`;
            const renderId = `render-${i}`;
            const qualityId = `quality-${i}`;
            tasks.push(this.createTask(transId, AutomationStage.EDITING, 'automation.transitions', `Select transitions #${i + 1}`, [`script-${i}`]));
            tasks.push(this.createTask(effectsId, AutomationStage.EDITING, 'automation.effects', `Assign effects #${i + 1}`, [`script-${i}`, `voice-${i}`]));
            tasks.push(this.createTask(captionsId, AutomationStage.EDITING, 'automation.caption_gen', `Generate captions #${i + 1}`, [`script-${i}`, `voice-${i}`]));
            tasks.push(this.createTask(timelineId, AutomationStage.EDITING, 'automation.timeline_builder', `Build timeline #${i + 1}`, [`image-${i}`, `video-${i}`, `voice-${i}`, transId, effectsId]));
            tasks.push(this.createTask(renderId, AutomationStage.EDITING, 'automation.render', `Render video #${i + 1}`, [timelineId, captionsId]));
            tasks.push(this.createTask(qualityId, AutomationStage.REVIEW, 'automation.quality_check', `Quality check #${i + 1}`, [renderId]));
            // Creator Success (post-render analysis)
            const creatorId = `creator-${i}`;
            tasks.push(this.createTask(creatorId, AutomationStage.REVIEW, 'automation.creator_success', `Creator success analysis #${i + 1}`, [qualityId, `script-${i}`]));
            // SEO + Publishing
            const seoId = `seo-${i}`;
            tasks.push(this.createTask(seoId, AutomationStage.SEO, 'automation.seo_gen', `Generate SEO #${i + 1}`, [`script-${i}`, creatorId]));
        }
        const workflow = {
            id: executionId,
            requestId: executionId,
            userId,
            projectId,
            status: TaskStatus.RUNNING,
            currentStage: AutomationStage.RESEARCH,
            tasks,
            metrics: this.createInitialMetrics(tasks.length),
            createdAt: new Date(),
            startedAt: new Date(),
            completedAt: null,
            updatedAt: new Date(),
        };
        const estimatedCostPerVideo = 0.60; // research + planning + script + prompts + images + voice + render
        const estimatedTimePerVideo = 3; // minutes (includes render time)
        return {
            id: executionId,
            request,
            stages,
            estimatedCostUsd: request.videoCount * estimatedCostPerVideo + 0.05,
            estimatedDurationMinutes: Math.ceil(request.videoCount * estimatedTimePerVideo + 1),
            taskCount: tasks.length,
            workflow,
            createdAt: new Date(),
        };
    }
    // ================================================================
    // Workflow Execution
    // ================================================================
    async executeWorkflow(plan, cancellation, userId) {
        const workflow = plan.workflow;
        const startTime = performance.now();
        try {
            for (const task of workflow.tasks) {
                if (cancellation.isCancelled) {
                    this.markTaskStatus(task, TaskStatus.CANCELLED);
                    workflow.status = TaskStatus.CANCELLED;
                    this.emitEvent(userId, 'automation.cancelled', { executionId: workflow.id });
                    return;
                }
                // Check dependencies
                const depsCompleted = task.dependsOn.every((depId) => {
                    const dep = workflow.tasks.find((t) => t.id === depId);
                    return dep?.status === TaskStatus.COMPLETED;
                });
                if (!depsCompleted) {
                    this.markTaskStatus(task, TaskStatus.FAILED);
                    task.error = 'Dependency not met';
                    continue;
                }
                // Execute with retries
                await this.executeTask(task, plan, workflow, cancellation, userId);
            }
            // Complete
            workflow.status = TaskStatus.COMPLETED;
            workflow.completedAt = new Date();
            workflow.metrics.totalDurationMs = Math.round(performance.now() - startTime);
            this.updateMetrics(workflow);
            this.emitEvent(userId, 'automation.completed', {
                executionId: workflow.id,
                metrics: workflow.metrics,
            });
            log.info('Automation completed', {
                executionId: workflow.id,
                totalDurationMs: workflow.metrics.totalDurationMs,
                totalCostUsd: workflow.metrics.totalCostUsd,
                completedTasks: workflow.metrics.completedTasks,
            });
        }
        catch (error) {
            workflow.status = TaskStatus.FAILED;
            workflow.completedAt = new Date();
            this.updateMetrics(workflow);
            this.emitEvent(userId, 'automation.failed', {
                executionId: workflow.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async executeTask(task, plan, workflow, cancellation, userId) {
        const agent = this.registry.getAgent(task.agentId);
        if (!agent) {
            this.markTaskStatus(task, TaskStatus.FAILED);
            task.error = `Agent "${task.agentId}" not registered`;
            log.error('Agent not found', { agentId: task.agentId, taskId: task.id });
            return;
        }
        for (let attempt = 1; attempt <= task.maxAttempts; attempt++) {
            if (cancellation.isCancelled) {
                this.markTaskStatus(task, TaskStatus.CANCELLED);
                return;
            }
            try {
                task.attempts = attempt;
                task.startedAt = new Date();
                this.markTaskStatus(task, attempt > 1 ? TaskStatus.RETRYING : TaskStatus.RUNNING);
                workflow.currentStage = task.stage;
                this.emitEvent(userId, 'task.started', {
                    executionId: workflow.id,
                    taskId: task.id,
                    stage: task.stage,
                    label: task.label,
                    attempt,
                });
                // Build input from previous task outputs
                const input = this.resolveTaskInput(task, plan, workflow);
                // Execute
                const onProgress = (progress, message) => {
                    task.progress = progress;
                    this.emitEvent(userId, 'task.progress', {
                        executionId: workflow.id,
                        taskId: task.id,
                        progress,
                        message,
                    });
                };
                const output = await agent.execute(input, onProgress, cancellation);
                // Success
                task.output = output;
                task.completedAt = new Date();
                task.durationMs = task.completedAt.getTime() - (task.startedAt?.getTime() ?? 0);
                task.progress = 100;
                this.markTaskStatus(task, TaskStatus.COMPLETED);
                this.emitEvent(userId, 'task.completed', {
                    executionId: workflow.id,
                    taskId: task.id,
                    stage: task.stage,
                    durationMs: task.durationMs,
                });
                log.info('Task completed', { taskId: task.id, stage: task.stage, durationMs: task.durationMs, attempt });
                return;
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                task.error = errorMsg;
                if (attempt >= task.maxAttempts) {
                    this.markTaskStatus(task, TaskStatus.FAILED);
                    task.completedAt = new Date();
                    task.durationMs = task.completedAt.getTime() - (task.startedAt?.getTime() ?? 0);
                    this.emitEvent(userId, 'task.failed', {
                        executionId: workflow.id,
                        taskId: task.id,
                        error: errorMsg,
                        attempts: attempt,
                    });
                    log.error('Task permanently failed', { taskId: task.id, attempts: attempt, error: errorMsg });
                    // Don't throw — continue to next task if this one has no required dependents
                    return;
                }
                log.warn('Task failed, retrying', { taskId: task.id, attempt, maxAttempts: task.maxAttempts, error: errorMsg });
                workflow.metrics.retryCount++;
                await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
            }
        }
    }
    // ================================================================
    // Helpers
    // ================================================================
    resolveTaskInput(task, plan, workflow) {
        const input = { request: plan.request };
        // Inject outputs from completed dependencies
        for (const depId of task.dependsOn) {
            const depTask = workflow.tasks.find((t) => t.id === depId);
            if (depTask?.output) {
                input[depId] = depTask.output;
            }
        }
        // ── Smart input mapping for planning pipeline ──
        // Map dependency outputs to the expected input field names for each agent.
        // This ensures each agent receives its data under the correct key.
        const agentId = task.agentId;
        const findOutput = (prefix) => {
            const t = workflow.tasks.find((t) => t.id.startsWith(prefix) && t.status === TaskStatus.COMPLETED);
            return t?.output ?? null;
        };
        // Extract the video index from task ID (e.g., "director-0" → 0)
        const match = task.id.match(/-(\d+)$/);
        const idx = match ? match[1] : '0';
        switch (agentId) {
            case 'automation.director':
                input.scriptPackage = findOutput(`script-${idx}`);
                input.title = plan.request.topic;
                break;
            case 'automation.storyboard':
                input.directorPlan = findOutput(`director-${idx}`);
                break;
            case 'automation.character':
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.directorPlan = findOutput(`director-${idx}`);
                break;
            case 'automation.scene_graph':
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.characterDatabase = findOutput(`character-${idx}`);
                input.directorPlan = findOutput(`director-${idx}`);
                break;
            case 'automation.world_state':
                input.sceneGraphPackage = findOutput(`scene-graph-${idx}`);
                input.characterDatabase = findOutput(`character-${idx}`);
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.directorPlan = findOutput(`director-${idx}`);
                break;
            case 'automation.asset_memory':
                input.directorPlan = findOutput(`director-${idx}`);
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.characterDatabase = findOutput(`character-${idx}`);
                input.sceneGraphPackage = findOutput(`scene-graph-${idx}`);
                input.worldStatePackage = findOutput(`world-state-${idx}`);
                break;
            case 'automation.image_intelligence':
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.characterDatabase = findOutput(`character-${idx}`);
                input.directorPlan = findOutput(`director-${idx}`);
                input.sceneGraphPackage = findOutput(`scene-graph-${idx}`);
                input.worldStatePackage = findOutput(`world-state-${idx}`);
                input.assetMemoryPackage = findOutput(`asset-memory-${idx}`);
                break;
            case 'automation.prompt_compiler':
                input.directorPlan = findOutput(`director-${idx}`);
                input.storyboard = findOutput(`storyboard-${idx}`);
                input.characterDatabase = findOutput(`character-${idx}`);
                input.sceneGraphPackage = findOutput(`scene-graph-${idx}`);
                input.worldStatePackage = findOutput(`world-state-${idx}`);
                input.assetMemoryPackage = findOutput(`asset-memory-${idx}`);
                break;
            case 'automation.prompt_optimizer':
                input.scriptPackage = findOutput(`script-${idx}`);
                break;
            case 'automation.image_gen':
                // prompts from prompt optimizer
                input.prompts = findOutput(`prompt-${idx}`);
                break;
            case 'automation.voice_gen':
                input.scriptPackage = findOutput(`script-${idx}`);
                break;
            case 'automation.video_gen':
                input.prompts = findOutput(`prompt-${idx}`);
                input.images = findOutput(`image-${idx}`);
                break;
            case 'automation.creator_success':
                input.plannerInput = {
                    topic: plan.request.topic,
                    category: 'general',
                    title: plan.request.topic,
                    hookText: '',
                    fullNarration: '',
                    sceneDurations: [],
                    totalDuration: 30,
                    keywords: [],
                    bestPlatform: plan.request.platform ?? 'youtube_shorts',
                    audienceSize: 'large',
                    hasThumbnailText: true,
                    hasThumbnailSubject: true,
                    hasThumbnailContrast: true,
                };
                // Enrich from script if available
                const scriptOutput = findOutput(`script-${idx}`);
                if (scriptOutput) {
                    const pi = input.plannerInput;
                    pi.hookText = scriptOutput.hook?.text ?? '';
                    pi.fullNarration = scriptOutput.fullNarration ?? '';
                    const scenes = scriptOutput.scenes;
                    if (scenes) {
                        pi.sceneDurations = scenes.map((s) => s.duration ?? 6);
                        pi.totalDuration = pi.sceneDurations.reduce((a, b) => a + b, 0);
                    }
                }
                break;
        }
        return input;
    }
    createTask(id, stage, agentId, label, dependsOn) {
        return {
            id, stage, agentId, label, status: TaskStatus.PENDING,
            progress: 0, input: {}, output: null, error: null,
            attempts: 0, maxAttempts: 3, startedAt: null, completedAt: null,
            durationMs: null, costUsd: null, dependsOn,
        };
    }
    markTaskStatus(task, status) {
        task.status = status;
    }
    createInitialMetrics(taskCount) {
        return { totalTasks: taskCount, completedTasks: 0, failedTasks: 0, totalCostUsd: 0, totalDurationMs: 0, averageTaskDurationMs: 0, retryCount: 0 };
    }
    updateMetrics(workflow) {
        const m = workflow.metrics;
        m.completedTasks = workflow.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
        m.failedTasks = workflow.tasks.filter((t) => t.status === TaskStatus.FAILED).length;
        m.totalCostUsd = workflow.tasks.reduce((s, t) => s + (t.costUsd ?? 0), 0);
        const completed = workflow.tasks.filter((t) => t.durationMs !== null);
        m.averageTaskDurationMs = completed.length > 0 ? Math.round(completed.reduce((s, t) => s + (t.durationMs ?? 0), 0) / completed.length) : 0;
    }
    emitEvent(userId, event, data) {
        this.sseManager.sendToUser(userId, event, { ...data, timestamp: new Date().toISOString() });
    }
    buildResponseMessage(request, plan) {
        return [
            `🚀 Starting automation: ${request.videoCount} ${request.platform.replace(/_/g, ' ')} video${request.videoCount > 1 ? 's' : ''} about "${request.topic}"`,
            '',
            `📋 Plan: ${plan.taskCount} tasks across ${plan.stages.length} stages`,
            `⏱️ Estimated time: ~${plan.estimatedDurationMinutes} minutes`,
            `💰 Estimated cost: $${plan.estimatedCostUsd.toFixed(2)}`,
            '',
            'Stages: Research → Planning → Script → Director → Storyboard → Character → SceneGraph → WorldState → AssetMemory → ImageIntelligence → PromptCompiler → ImageGen → VoiceGen → VideoGen → Music → Timeline → Render → Quality → CreatorSuccess → SEO → Publish',
            '',
            'Streaming progress in real-time...',
        ].join('\n');
    }
}
//# sourceMappingURL=master-agent.js.map