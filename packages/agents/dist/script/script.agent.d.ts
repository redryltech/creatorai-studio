import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, Script } from '@creatorai/shared';
import { AgentId, ContentType, Platform, ScriptStyle } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
export interface ScriptAgentInput {
    topic: string;
    contentType: ContentType;
    targetPlatform: Platform;
    duration?: number;
    style: ScriptStyle;
    tone: string;
    language: string;
    keyPoints?: string[];
    brandVoice?: string;
}
export type ScriptAgentOutput = Script;
export declare class ScriptAgent extends BaseAgent<ScriptAgentInput, ScriptAgentOutput> {
    readonly id = AgentId.SCRIPT;
    readonly name = "Script Writer";
    readonly version = "1.0.0";
    readonly description = "Generates professional video scripts with scene-by-scene breakdown";
    getMetadata(): AgentMetadata;
    protected doValidate(input: ScriptAgentInput): Promise<ValidationResult>;
    protected doExecute(input: ScriptAgentInput, context: AgentContext): Promise<{
        data: ScriptAgentOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected doRollback(_context: AgentContext): Promise<void>;
    protected doEstimateCost(input: ScriptAgentInput): Promise<CostEstimate>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    private calculateSceneCount;
    private formatPlatformName;
    /**
     * Normalize the raw LLM output into our Script type.
     * Handles common LLM quirks: wrong field names, missing fields, etc.
     */
    private normalizeScript;
    /**
     * Basic quality gate — catches obviously broken scripts.
     */
    private validateScript;
}
//# sourceMappingURL=script.agent.d.ts.map