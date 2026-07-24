import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationRequest, ResearchReport } from '../types/automation.types';
import { AutomationStage } from '../types/automation.types';
interface ResearchInput {
    request: AutomationRequest;
}
export declare class ResearchAgent implements IAutomationAgent<ResearchInput, ResearchReport> {
    readonly agentId = "automation.research";
    readonly agentName = "Research Agent";
    readonly stage = AutomationStage.RESEARCH;
    validate(input: ResearchInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: ResearchInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: ResearchInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ResearchReport>;
}
export {};
//# sourceMappingURL=research-agent.d.ts.map