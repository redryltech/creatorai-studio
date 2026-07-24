// ============================================================
// CreatorAI Studio — Agent Interface
// ============================================================
// This is THE contract every agent must implement.
// The pipeline engine depends ONLY on this interface,
// never on concrete agent implementations.
// ============================================================

import type {
  AgentContext,
  AgentResult,
  CostEstimate,
  HealthCheckResult,
  ValidationResult,
} from '@creatorai/shared';

/**
 * Core agent interface — the foundation of the agent system.
 *
 * Design rationale:
 * - `validate()` catches invalid input BEFORE expensive API calls
 * - `execute()` performs the actual work
 * - `rollback()` cleans up on failure (delete uploaded files, etc.)
 * - `estimateCost()` enables cost preview before execution
 * - `healthCheck()` enables monitoring and circuit-breaking
 *
 * @typeParam TInput — The shape of data this agent accepts
 * @typeParam TOutput — The shape of data this agent produces
 */
export interface IAgent<TInput = unknown, TOutput = unknown> {
  /** Unique identifier matching AgentId enum */
  readonly id: string;

  /** Human-readable agent name */
  readonly name: string;

  /** Semantic version string */
  readonly version: string;

  /** What this agent does */
  readonly description: string;

  /**
   * Validate input data before execution.
   * Should be fast — no API calls, no I/O.
   *
   * @param input - Data to validate
   * @returns Validation result with any errors
   */
  validate(input: TInput): Promise<ValidationResult>;

  /**
   * Execute the agent's primary function.
   * This is where the actual work happens (API calls, processing, etc.).
   *
   * @param input - Validated input data
   * @param context - Pipeline execution context (shared state, progress reporting)
   * @returns Agent result with output data and metrics
   */
  execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;

  /**
   * Rollback/cleanup after a failure.
   * Delete any resources created during a failed execution.
   *
   * @param context - Pipeline execution context
   */
  rollback(context: AgentContext): Promise<void>;

  /**
   * Get the current execution status of this agent.
   * Used for long-running operations to report intermediate state.
   */
  getStatus(): AgentStatus;

  /**
   * Estimate the cost of executing this agent with the given input.
   * Called before execution to show users the expected cost.
   *
   * @param input - Input data to estimate cost for
   * @returns Cost breakdown
   */
  estimateCost(input: TInput): Promise<CostEstimate>;

  /**
   * Check if this agent and its dependencies are healthy.
   * Used for monitoring, readiness checks, and circuit-breaking.
   */
  healthCheck(): Promise<HealthCheckResult>;
}

/**
 * Agent execution status — returned by getStatus().
 */
export interface AgentStatus {
  isRunning: boolean;
  progress: number; // 0-100
  currentOperation: string | null;
  startedAt: Date | null;
  lastError: string | null;
}

/**
 * Agent metadata — describes an agent's capabilities for the registry.
 */
export interface AgentMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema
  outputSchema: Record<string, unknown>; // JSON Schema
  dependencies: string[]; // IDs of agents this typically runs after
  estimatedDuration: {
    min: number; // seconds
    max: number;
    average: number;
  };
  supportedProviders: string[];
}
