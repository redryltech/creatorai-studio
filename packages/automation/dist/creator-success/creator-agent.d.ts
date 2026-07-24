import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { CreatorSuccessPackage } from './creator.types';
import { type CreatorPlannerInput } from './creator-planner';
export interface CreatorSuccessInput {
    request: Record<string, unknown>;
    plannerInput: CreatorPlannerInput;
}
export declare class CreatorSuccessAgent implements IAutomationAgent<CreatorSuccessInput, CreatorSuccessPackage> {
    readonly agentId = "automation.creator_success";
    readonly agentName = "Creator Success Engine";
    readonly stage: AutomationStage;
    validate(input: CreatorSuccessInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: CreatorSuccessInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CreatorSuccessPackage>;
}
//# sourceMappingURL=creator-agent.d.ts.map