import type { Pipeline } from '@creatorai/shared';
import type { PipelineRepository } from '@creatorai/database';
/**
 * Configuration for the pipeline runner.
 */
export interface PipelineRunnerConfig {
    /** Maximum parallel agent executions */
    maxConcurrency: number;
    /** Default retry delay base (ms) */
    retryBaseDelayMs: number;
    /** Maximum retry delay (ms) */
    retryMaxDelayMs: number;
}
/**
 * Pipeline Runner — executes a pipeline plan as a DAG.
 */
export declare class PipelineRunner {
    private readonly config;
    private readonly agentRegistry;
    private readonly eventBus;
    private readonly pipelineRepo;
    private readonly cancelledPipelines;
    constructor(pipelineRepo: PipelineRepository, config?: Partial<PipelineRunnerConfig>);
    /**
     * Execute a pipeline from start to finish.
     *
     * Algorithm:
     * 1. Find all steps with no unmet dependencies (ready steps)
     * 2. Execute ready steps in parallel (up to maxConcurrency)
     * 3. When a step completes, check if new steps are now ready
     * 4. Repeat until all steps are done or a non-optional step fails
     */
    run(pipeline: Pipeline): Promise<Pipeline>;
    /**
     * Cancel a running pipeline.
     */
    cancel(pipelineId: string): void;
    /**
     * Execute a single pipeline step with retry logic.
     */
    private executeStep;
    /**
     * Check if a step is optional (its template says so or has no
     * non-optional dependents).
     */
    private isStepOptional;
    /**
     * Skip all steps that depend on a failed step.
     */
    private skipDependentSteps;
}
//# sourceMappingURL=pipeline-runner.d.ts.map