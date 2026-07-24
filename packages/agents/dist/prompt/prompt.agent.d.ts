import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ScriptScene, ScenePrompt } from '@creatorai/shared';
import { AgentId, ArtStyle, AspectRatio } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
export interface PromptAgentInput {
    scenes: ScriptScene[];
    artStyle: ArtStyle;
    aspectRatio: AspectRatio;
    targetModel: 'flux' | 'dalle3' | 'sdxl';
    characterConsistency: boolean;
    characterDescriptions?: Array<{
        name: string;
        description: string;
    }>;
}
export interface PromptAgentOutput {
    scenePrompts: ScenePrompt[];
}
export declare class PromptAgent extends BaseAgent<PromptAgentInput, PromptAgentOutput> {
    readonly id = AgentId.PROMPT;
    readonly name = "Prompt Generator";
    readonly version = "1.0.0";
    readonly description = "Generates optimized AI image/video prompts from script scenes";
    getMetadata(): AgentMetadata;
    protected doValidate(input: PromptAgentInput): Promise<ValidationResult>;
    protected doExecute(input: PromptAgentInput, context: AgentContext): Promise<{
        data: PromptAgentOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected doRollback(_context: AgentContext): Promise<void>;
    protected doEstimateCost(input: PromptAgentInput): Promise<CostEstimate>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    private getDimensions;
    private formatArtStyle;
    private getStyleSuffix;
}
//# sourceMappingURL=prompt.agent.d.ts.map