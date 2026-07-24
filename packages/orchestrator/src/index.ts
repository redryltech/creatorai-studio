// ============================================================
// @creatorai/orchestrator — Main Entry Point
// ============================================================

// ---- Legacy (kept for backwards compatibility) ----
export { PipelineEventBus, PipelineEventType, type PipelineEventPayload, type PipelineEventListener } from './events/event-bus';
export {
  PIPELINE_TEMPLATES, getPipelineTemplate, templateStepToPipelineStep,
  FULL_VIDEO_PIPELINE, SCRIPT_ONLY_PIPELINE, THUMBNAIL_ONLY_PIPELINE,
  RESEARCH_ONLY_PIPELINE, VOICEOVER_ONLY_PIPELINE, SEO_ONLY_PIPELINE,
  type PipelineTemplate, type PipelineStepTemplate,
} from './planner/pipeline-templates';
export { PipelineRunner, type PipelineRunnerConfig } from './runner/pipeline-runner';

// ---- Phase 3: Orchestration Layer ----

// Intent
export { IntentParser } from './intent/intent-parser';
export { IntentAction, type ParsedIntent, type IntentEntities, DEFAULT_ENTITIES } from './intent/intent.types';
export { INTENT_PARSER_TEMPLATE } from './intent/intent.prompts';

// Planner
export { Planner } from './planner/planner';
export type { WorkflowPlan, WorkflowNode, WorkflowInputMapping, WorkflowRun, NodeRunState } from './planner/workflow.types';
export { WorkflowStatus, NodeStatus } from './planner/workflow.types';

// Artifacts
export { ArtifactManager } from './artifacts/artifact-manager';
export { ArtifactType, ArtifactStatus, type Artifact } from './artifacts/artifact.types';

// Executor
export { WorkflowExecutor, type ExecutorConfig } from './executor/workflow-executor';
export { WorkflowEventEmitter, WorkflowEventType, type WorkflowEvent, type WorkflowEventHandler } from './executor/workflow-events';

// Conversation Orchestrator
export {
  ConversationOrchestrator,
  type OrchestratorRequest,
  type OrchestratorResponse,
  type OrchestratorWorkflowResult,
} from './conversation/conversation-orchestrator';
