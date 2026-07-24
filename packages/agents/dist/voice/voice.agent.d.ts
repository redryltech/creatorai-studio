import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ScriptScene, VoiceResult } from '@creatorai/shared';
import { AgentId } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
export interface VoiceAgentInput {
    scenes: ScriptScene[];
    voiceId?: string;
    language?: string;
    speed?: number;
    provider?: string;
}
export interface VoiceAgentOutput {
    voiceovers: Array<VoiceResult & {
        sceneId: string;
    }>;
    totalDuration: number;
    failedScenes: string[];
}
export declare class VoiceAgent extends BaseAgent<VoiceAgentInput, VoiceAgentOutput> {
    readonly id = AgentId.VOICE;
    readonly name = "Voice Generator";
    readonly version = "1.0.0";
    readonly description = "Generates AI voiceover narration for video scenes";
    getMetadata(): AgentMetadata;
    protected doValidate(input: VoiceAgentInput): Promise<ValidationResult>;
    protected doExecute(input: VoiceAgentInput, context: AgentContext): Promise<{
        data: VoiceAgentOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected doRollback(context: AgentContext): Promise<void>;
    protected doEstimateCost(input: VoiceAgentInput): Promise<CostEstimate>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
}
//# sourceMappingURL=voice.agent.d.ts.map