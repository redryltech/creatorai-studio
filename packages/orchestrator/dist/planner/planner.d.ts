import type { ParsedIntent } from '../intent/intent.types';
import type { WorkflowPlan } from './workflow.types';
export declare class Planner {
    /**
     * Build a WorkflowPlan from a ParsedIntent.
     *
     * For batch operations (count > 1), the strategy is invoked
     * once per item, producing independent sub-DAGs that can
     * execute in parallel across items.
     */
    buildPlan(intent: ParsedIntent): WorkflowPlan;
    /**
     * Topological sort using Kahn's algorithm.
     * Returns node IDs in valid execution order.
     */
    private topologicalSort;
    /**
     * Find groups of nodes that can execute in parallel.
     * Two nodes can be parallel if neither depends on the other.
     */
    private findParallelGroups;
    /**
     * Estimate total wall-clock duration considering parallelism.
     * For each depth level, take the max duration (parallel nodes overlap).
     */
    private estimateTotalDuration;
    private generatePlanName;
    private emptyPlan;
}
//# sourceMappingURL=planner.d.ts.map