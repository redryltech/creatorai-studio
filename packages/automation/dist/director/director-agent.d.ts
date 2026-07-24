import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { ScriptPackage, AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from './director.types';
export interface DirectorInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    title?: string;
    overrides?: Partial<{
        colorGrading: string;
        pacing: string;
        category: string;
    }>;
}
export declare class DirectorAgent implements IAutomationAgent<DirectorInput, DirectorPlan> {
    readonly agentId = "automation.director";
    readonly agentName = "AI Director";
    readonly stage: AutomationStage;
    validate(input: DirectorInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(_input: DirectorInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: DirectorInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<DirectorPlan>;
}
//# sourceMappingURL=director-agent.d.ts.map