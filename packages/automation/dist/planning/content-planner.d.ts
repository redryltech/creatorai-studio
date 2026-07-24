import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationRequest, ResearchReport, ContentPlan } from '../types/automation.types';
import { AutomationStage } from '../types/automation.types';
interface PlannerInput {
    request: AutomationRequest;
    research: ResearchReport;
}
export declare class ContentPlannerAgent implements IAutomationAgent<PlannerInput, ContentPlan> {
    readonly agentId = "automation.planner";
    readonly agentName = "Content Planner";
    readonly stage = AutomationStage.PLANNING;
    validate(input: PlannerInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(_input: PlannerInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: PlannerInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ContentPlan>;
}
export {};
//# sourceMappingURL=content-planner.d.ts.map