import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { OptimizedPromptPackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';
interface PromptOptimizerInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    artStyle?: string;
    aspectRatio?: string;
}
export declare class PromptOptimizerAgent implements IAutomationAgent<PromptOptimizerInput, OptimizedPromptPackage> {
    readonly agentId = "automation.prompt_optimizer";
    readonly agentName = "Prompt Optimizer";
    readonly stage = AutomationStage.MEDIA;
    validate(input: PromptOptimizerInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: PromptOptimizerInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: PromptOptimizerInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<OptimizedPromptPackage>;
}
export {};
//# sourceMappingURL=prompt-optimizer.d.ts.map