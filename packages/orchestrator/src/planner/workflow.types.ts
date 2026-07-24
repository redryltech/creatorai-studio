// ============================================================
// CreatorAI Studio — Workflow Types
// ============================================================
// A Workflow is the execution plan — the DAG of nodes.
// The Planner produces a Workflow. The Executor runs it.
// These are the types that connect the two.
// ============================================================

/**
 * A single node in the workflow DAG.
 * Each node maps to exactly one agent invocation.
 */
export interface WorkflowNode {
  /** Unique node ID within this workflow (e.g., "script-1") */
  id: string;

  /** Which agent executes this node */
  agentId: string;

  /** Human-readable label for UI display */
  label: string;

  /** IDs of nodes that must complete before this one starts */
  dependsOn: string[];

  /** Input data for the agent (resolved at execution time from artifacts + context) */
  inputMapping: WorkflowInputMapping;

  /** Retry policy for this node */
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };

  /** Maximum wall-clock time for this node (ms) */
  timeoutMs: number;

  /** Expected artifact types this node produces */
  expectedArtifacts: string[];

  /** Estimated cost in USD */
  estimatedCostUsd: number;

  /** Estimated duration in seconds */
  estimatedDurationSec: number;

  /** Whether the workflow continues if this node fails */
  optional: boolean;

  /** Execution priority (lower = higher priority within parallel group) */
  priority: number;
}

/**
 * Describes how to construct a node's input at execution time.
 *
 * Sources:
 * - "intent"    → value comes from the ParsedIntent entities
 * - "artifact"  → value comes from an artifact produced by a previous node
 * - "static"    → hardcoded value from the plan
 * - "context"   → value from the pipeline execution context
 */
export interface WorkflowInputMapping {
  [inputField: string]: {
    source: 'intent' | 'artifact' | 'static' | 'context';
    /** Key to look up in the source (e.g., "topic" for intent, "script-1.scenes" for artifact) */
    key: string;
    /** Fallback value if the key is missing */
    fallback?: unknown;
  };
}

/**
 * The complete workflow plan — produced by the Planner, consumed by the Executor.
 */
export interface WorkflowPlan {
  /** Unique plan ID */
  id: string;

  /** Human-readable plan name */
  name: string;

  /** The parsed intent that generated this plan */
  intentAction: string;

  /** All nodes in the workflow */
  nodes: WorkflowNode[];

  /** Groups of node IDs that can execute in parallel */
  parallelGroups: string[][];

  /** Topologically sorted execution order (respecting dependencies) */
  executionOrder: string[];

  /** Total estimated cost in USD */
  estimatedTotalCostUsd: number;

  /** Total estimated duration in seconds */
  estimatedTotalDurationSec: number;

  /** Number of items being produced (e.g., 10 videos) */
  itemCount: number;

  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Workflow execution status — persisted to Firestore.
 */
export enum WorkflowStatus {
  PLANNED = 'planned',
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Node execution status.
 */
export enum NodeStatus {
  PENDING = 'pending',
  WAITING = 'waiting',     // Dependencies not yet met
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
}

/**
 * Runtime state of a workflow execution.
 */
export interface WorkflowRun {
  id: string;
  planId: string;
  userId: string;
  projectId: string;
  status: WorkflowStatus;
  progress: number;          // 0-100
  currentNodeId: string | null;
  nodeStates: Map<string, NodeRunState>;
  startedAt: Date | null;
  completedAt: Date | null;
  error: { nodeId: string; message: string; code: string } | null;
  totalCostUsd: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Runtime state of a single node.
 */
export interface NodeRunState {
  nodeId: string;
  status: NodeStatus;
  attempts: number;
  progress: number;          // 0-100
  artifactIds: string[];     // Artifacts produced by this node
  startedAt: Date | null;
  completedAt: Date | null;
  durationMs: number | null;
  costUsd: number | null;
  error: string | null;
}
