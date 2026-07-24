import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from './storyboard.types';
export interface StoryboardInput {
    request: Record<string, unknown>;
    directorPlan: DirectorPlan;
}
export declare class StoryboardAgent implements IAutomationAgent<StoryboardInput, Storyboard> {
    readonly agentId = "automation.storyboard";
    readonly agentName = "Storyboard Engine";
    readonly stage: AutomationStage;
    validate(input: StoryboardInput): {
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
    execute(input: StoryboardInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<Storyboard>;
}
//# sourceMappingURL=storyboard-agent.d.ts.map