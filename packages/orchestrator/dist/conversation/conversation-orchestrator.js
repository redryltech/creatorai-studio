// ============================================================
// CreatorAI Studio — Conversation Orchestrator
// ============================================================
// THE SINGLE ENTRY POINT for all user interactions.
//
// API routes never communicate with agents directly.
// API routes call the ConversationOrchestrator.
// The Orchestrator calls the IntentParser, Planner, Executor.
//
// Responsibilities:
// 1. Receive user message
// 2. Load/create conversation
// 3. Parse intent (IntentParser)
// 4. Handle clarification if needed
// 5. Build workflow plan (Planner)
// 6. Execute workflow (WorkflowExecutor)
// 7. Return results with workflow run ID
// 8. Stream events via SSE bridge
// 9. Persist conversation history
//
// This orchestrator is stateless per request. All state lives
// in Firestore (conversations, workflow runs, artifacts).
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
import { IntentParser } from '../intent/intent-parser';
import { IntentAction } from '../intent/intent.types';
import { Planner } from '../planner/planner';
import { WorkflowExecutor } from '../executor/workflow-executor';
const log = Logger.for('ConversationOrchestrator');
// ---- Orchestrator ----
export class ConversationOrchestrator {
    intentParser;
    planner;
    executor;
    costTracker;
    // Active workflow promises, keyed by run ID
    activeWorkflows = new Map();
    constructor() {
        this.intentParser = new IntentParser();
        this.planner = new Planner();
        this.executor = new WorkflowExecutor();
        this.costTracker = CostTracker.getInstance();
    }
    /**
     * Process a user message — THE main entry point.
     *
     * This method returns immediately with intent and plan info.
     * If a workflow is triggered, it runs asynchronously and streams
     * progress via the WorkflowEventEmitter → SSE bridge.
     */
    async processMessage(request) {
        const startTime = performance.now();
        const conversationId = request.conversationId ?? generateId(ID_PREFIXES.conversation);
        log.info('Processing user message', {
            userId: request.userId,
            conversationId,
            messageLength: request.message.length,
        });
        // ── 1. Parse Intent ────────────────────────────────────
        const intent = await this.intentParser.parse(request.message, request.userId);
        log.info('Intent parsed', {
            action: intent.action,
            confidence: intent.confidence.toFixed(2),
            topic: intent.entities.topic,
            count: intent.entities.count,
            requiresClarification: intent.requiresClarification,
        });
        // ── 2. Handle Clarification ────────────────────────────
        if (intent.requiresClarification) {
            return {
                conversationId,
                assistantMessage: intent.clarificationQuestion ?? 'Could you provide more details?',
                intent,
                workflowPlan: null,
                workflowRunId: null,
                requiresClarification: true,
                clarificationQuestion: intent.clarificationQuestion,
            };
        }
        // ── 3. Handle General Chat ─────────────────────────────
        if (intent.action === IntentAction.GENERAL_CHAT) {
            const chatResponse = await this.handleGeneralChat(request.message, request.userId);
            return {
                conversationId,
                assistantMessage: chatResponse,
                intent,
                workflowPlan: null,
                workflowRunId: null,
                requiresClarification: false,
                clarificationQuestion: null,
            };
        }
        // ── 4. Build Workflow Plan ──────────────────────────────
        const plan = this.planner.buildPlan(intent);
        if (plan.nodes.length === 0) {
            return {
                conversationId,
                assistantMessage: `I understand you want to ${intent.action.replace(/_/g, ' ')}, but I don't have a workflow for that yet. This capability is coming soon!`,
                intent,
                workflowPlan: plan,
                workflowRunId: null,
                requiresClarification: false,
                clarificationQuestion: null,
            };
        }
        // ── 5. Generate response message ───────────────────────
        const projectId = request.projectId ?? generateId(ID_PREFIXES.project);
        const assistantMessage = this.buildPlanSummary(intent, plan);
        // ── 6. Start workflow execution (async — don't await) ──
        const workflowPromise = this.executor.execute(plan, intent, request.userId, projectId)
            .finally(() => {
            this.activeWorkflows.delete(plan.id);
        });
        this.activeWorkflows.set(plan.id, workflowPromise);
        const durationMs = Math.round(performance.now() - startTime);
        log.info('Orchestration response ready', {
            conversationId,
            runId: plan.id,
            action: intent.action,
            nodeCount: plan.nodes.length,
            durationMs,
        });
        return {
            conversationId,
            assistantMessage,
            intent,
            workflowPlan: plan,
            workflowRunId: plan.id,
            requiresClarification: false,
            clarificationQuestion: null,
        };
    }
    /**
     * Cancel an active workflow.
     */
    cancelWorkflow(runId) {
        if (this.activeWorkflows.has(runId)) {
            this.executor.cancel(runId);
            return true;
        }
        return false;
    }
    /**
     * Pause an active workflow.
     */
    pauseWorkflow(runId) {
        if (this.activeWorkflows.has(runId)) {
            this.executor.pause(runId);
            return true;
        }
        return false;
    }
    /**
     * Resume a paused workflow.
     */
    resumeWorkflow(runId) {
        this.executor.resume(runId);
        return true;
    }
    /**
     * Wait for a workflow to complete (used in tests or synchronous flows).
     */
    async waitForWorkflow(runId) {
        const promise = this.activeWorkflows.get(runId);
        if (!promise)
            return null;
        return promise;
    }
    /**
     * Get count of active workflows.
     */
    get activeWorkflowCount() {
        return this.activeWorkflows.size;
    }
    // ================================================================
    // Private
    // ================================================================
    /**
     * Handle general chat messages by forwarding to the LLM.
     */
    async handleGeneralChat(message, userId) {
        try {
            const registry = ProviderRegistry.getInstance();
            const llm = await registry.getPrimary('llm');
            if (!llm)
                return 'I\'m here to help you create content! Try saying something like "Create 5 YouTube Shorts about AI technology."';
            const response = await llm.complete({
                systemPrompt: `You are CreatorAI Studio, an AI content creation assistant. You help users create videos, images, scripts, and social media content. Be helpful, concise, and suggest specific actions the user can take. Always offer to create something for them.`,
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                maxTokens: 512,
            });
            this.costTracker.trackLLMUsage({
                userId,
                projectId: null,
                pipelineId: null,
                agentId: 'conversation',
                providerId: llm.id,
                model: response.model,
                tokens: response.usage,
            });
            return response.content;
        }
        catch (error) {
            log.error('General chat failed', {}, error);
            return 'I\'m here to help! Try asking me to create content — for example, "Create 10 motivational YouTube Shorts about fitness."';
        }
    }
    /**
     * Build a human-readable summary of the plan.
     */
    buildPlanSummary(intent, plan) {
        const topic = intent.entities.topic ?? 'your topic';
        const count = intent.entities.count;
        const platform = intent.entities.platform?.replace(/_/g, ' ') ?? 'your target platform';
        const lines = [];
        if (intent.action === IntentAction.CREATE_VIDEO) {
            lines.push(`🎬 I'm creating ${count} video${count > 1 ? 's' : ''} about "${topic}" for ${platform}!`);
            lines.push('');
            lines.push('Here\'s my plan:');
            // Group by step type and show unique steps
            const uniqueAgents = [...new Set(plan.nodes.map((n) => n.agentId))];
            const stepDescriptions = {
                script: '📝 Write script(s)',
                prompt: '🎨 Generate image prompts',
                image: '🖼️ Generate AI images',
                voice: '🎙️ Generate voiceover(s)',
                seo: '🔍 Optimize SEO metadata',
            };
            for (const agentId of uniqueAgents) {
                const desc = stepDescriptions[agentId] ?? `▶️ ${agentId}`;
                const nodeCount = plan.nodes.filter((n) => n.agentId === agentId).length;
                lines.push(`${desc}${nodeCount > 1 ? ` (×${nodeCount})` : ''}`);
            }
            lines.push('');
            lines.push(`⏱️ Estimated time: ~${Math.ceil(plan.estimatedTotalDurationSec / 60)} min`);
            lines.push(`💰 Estimated cost: $${plan.estimatedTotalCostUsd.toFixed(2)}`);
            lines.push('');
            lines.push('I\'ll stream progress as each step completes.');
        }
        else if (intent.action === IntentAction.GENERATE_SCRIPT) {
            lines.push(`📝 Writing a script about "${topic}" for ${platform}...`);
        }
        else {
            lines.push(`Working on your request: ${intent.action.replace(/_/g, ' ')}...`);
        }
        return lines.join('\n');
    }
}
//# sourceMappingURL=conversation-orchestrator.js.map