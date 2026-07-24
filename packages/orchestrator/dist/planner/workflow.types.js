// ============================================================
// CreatorAI Studio — Workflow Types
// ============================================================
// A Workflow is the execution plan — the DAG of nodes.
// The Planner produces a Workflow. The Executor runs it.
// These are the types that connect the two.
// ============================================================
/**
 * Workflow execution status — persisted to Firestore.
 */
export var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["PLANNED"] = "planned";
    WorkflowStatus["QUEUED"] = "queued";
    WorkflowStatus["RUNNING"] = "running";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
})(WorkflowStatus || (WorkflowStatus = {}));
/**
 * Node execution status.
 */
export var NodeStatus;
(function (NodeStatus) {
    NodeStatus["PENDING"] = "pending";
    NodeStatus["WAITING"] = "waiting";
    NodeStatus["RUNNING"] = "running";
    NodeStatus["COMPLETED"] = "completed";
    NodeStatus["FAILED"] = "failed";
    NodeStatus["SKIPPED"] = "skipped";
    NodeStatus["CANCELLED"] = "cancelled";
    NodeStatus["RETRYING"] = "retrying";
})(NodeStatus || (NodeStatus = {}));
//# sourceMappingURL=workflow.types.js.map