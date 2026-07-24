import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationRequest, ContentPlan, ScriptPackage } from '../types/automation.types';
import { AutomationStage } from '../types/automation.types';
interface ScriptPlannerInput {
    request: AutomationRequest;
    planning: ContentPlan;
    ideaIndex: number;
}
export declare class ScriptPlannerAgent implements IAutomationAgent<ScriptPlannerInput, ScriptPackage> {
    readonly agentId = "automation.script_planner";
    readonly agentName = "Script Planner";
    readonly stage = AutomationStage.SCRIPTING;
    validate(input: ScriptPlannerInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(_input: ScriptPlannerInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: ScriptPlannerInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ScriptPackage>;
}
export {};
//# sourceMappingURL=script-planner.d.ts.map