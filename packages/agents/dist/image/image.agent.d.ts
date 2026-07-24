import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ScenePrompt, ImageResult } from '@creatorai/shared';
import { AgentId } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
export interface ImageAgentInput {
    scenePrompts: ScenePrompt[];
    provider?: string;
    model?: string;
}
export interface ImageAgentOutput {
    images: ImageResult[];
    failedScenes: string[];
}
export declare class ImageAgent extends BaseAgent<ImageAgentInput, ImageAgentOutput> {
    readonly id = AgentId.IMAGE;
    readonly name = "Image Generator";
    readonly version = "1.0.0";
    readonly description = "Generates AI images for each video scene";
    getMetadata(): AgentMetadata;
    protected doValidate(input: ImageAgentInput): Promise<ValidationResult>;
    protected doExecute(input: ImageAgentInput, context: AgentContext): Promise<{
        data: ImageAgentOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected doRollback(context: AgentContext): Promise<void>;
    protected doEstimateCost(input: ImageAgentInput): Promise<CostEstimate>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
}
//# sourceMappingURL=image.agent.d.ts.map