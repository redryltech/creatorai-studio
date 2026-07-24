import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { ResearchPackage } from './research.types';
/** Input for the research agent. */
export interface ResearchIntelligenceInput {
    request: Record<string, unknown>;
    topic: string;
}
/**
 * Research Intelligence Agent.
 * Performs comprehensive market research, trend analysis,
 * keyword engineering, competitor mapping, audience profiling,
 * topic discovery, and content gap analysis.
 *
 * @implements IAutomationAgent<ResearchIntelligenceInput, ResearchPackage>
 */
export declare class ResearchIntelligenceAgent implements IAutomationAgent<ResearchIntelligenceInput, ResearchPackage> {
    readonly agentId = "automation.research_intelligence";
    readonly agentName = "Research Intelligence Engine";
    readonly stage: AutomationStage;
    validate(input: ResearchIntelligenceInput): {
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
    execute(input: ResearchIntelligenceInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ResearchPackage>;
}
//# sourceMappingURL=research-agent.d.ts.map