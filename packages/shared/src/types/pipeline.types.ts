// ============================================================
// CreatorAI Studio — Pipeline & Agent Types
// ============================================================

import { AgentId, PipelineStatus, StepStatus } from './enums';

/**
 * A single step in a pipeline execution plan.
 */
export interface PipelineStep {
  id: string;
  agentId: AgentId;
  name: string;
  description: string;
  status: StepStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: StepError | null;
  startedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
  maxRetries: number;
  dependsOn: string[]; // Step IDs this step depends on
  estimatedDurationSec: number;
  actualDurationSec: number | null;
  progress: number; // 0-100 for long-running steps
}

/**
 * Error captured during step execution.
 */
export interface StepError {
  code: string;
  message: string;
  provider: string | null;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Pipeline execution plan — the complete DAG.
 */
export interface PipelinePlan {
  steps: PipelineStep[];
  metadata: {
    totalEstimatedDuration: number; // seconds
    estimatedCost: number | null; // USD
    parallelGroups: string[][]; // Groups of step IDs that can run in parallel
  };
}

/**
 * Pipeline document — stored in Firestore `pipelines/{pipelineId}`.
 */
export interface Pipeline {
  id: string;
  projectId: string;
  userId: string;
  status: PipelineStatus;
  currentStep: string | null;
  progress: number; // 0-100 overall
  plan: PipelinePlan;
  error: {
    message: string;
    step: string;
    timestamp: Date;
    code: string;
  } | null;
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}

/**
 * Execution context passed to every agent during pipeline execution.
 * This is how agents share data without direct coupling.
 */
export interface AgentContext {
  /** Unique pipeline execution ID */
  pipelineId: string;

  /** Project being processed */
  projectId: string;

  /** User who owns the project */
  userId: string;

  /** Correlation ID for tracing across agents */
  correlationId: string;

  /**
   * Shared data store — agents read outputs from previous steps
   * and write their own outputs here.
   * Key format: `{agentId}.{fieldName}`
   */
  store: Record<string, unknown>;

  /** Emit progress updates (0-100) */
  reportProgress: (progress: number, message?: string) => void;

  /** Emit a log message */
  log: (level: 'info' | 'warn' | 'error', message: string, data?: unknown) => void;

  /** Check if cancellation has been requested */
  isCancelled: () => boolean;

  /** Get a value from the shared store with type safety */
  getStoreValue: <T>(key: string) => T | undefined;

  /** Set a value in the shared store */
  setStoreValue: (key: string, value: unknown) => void;
}

/**
 * Result returned by an agent after execution.
 */
export interface AgentResult<T> {
  success: boolean;
  data: T | null;
  error: StepError | null;
  metrics: {
    durationMs: number;
    tokensUsed: number | null;
    costUsd: number | null;
    provider: string;
  };
}

/**
 * Cost estimate returned by agent.estimateCost().
 */
export interface CostEstimate {
  provider: string;
  model: string;
  estimatedCostUsd: number;
  breakdown: Array<{
    item: string;
    quantity: number;
    unitCostUsd: number;
    totalCostUsd: number;
  }>;
}

/**
 * Validation result from agent.validate().
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Health check result from agent.healthCheck().
 */
export interface HealthCheckResult {
  healthy: boolean;
  provider: string;
  latencyMs: number;
  details: Record<string, unknown>;
}

/**
 * Parsed user intent from the chat message.
 */
export interface ParsedIntent {
  action: string;
  confidence: number;
  entities: {
    topic: string | null;
    count: number;
    contentType: string | null;
    platform: string | null;
    style: string | null;
    duration: number | null;
    language: string | null;
  };
  rawMessage: string;
  suggestedPipeline: string | null; // Pipeline template ID
}
