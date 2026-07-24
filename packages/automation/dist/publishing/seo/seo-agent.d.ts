import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage, AutomationRequest } from '../../types/automation.types';
import type { SEOPackage } from '../types/publishing.types';
import { AutomationStage } from '../../types/automation.types';
interface SEOInput {
    request: AutomationRequest;
    scriptPackage: ScriptPackage;
}
export declare class SEOGeneratorAgent implements IAutomationAgent<SEOInput, SEOPackage> {
    readonly agentId = "automation.seo_gen";
    readonly agentName = "SEO Generator";
    readonly stage = AutomationStage.SEO;
    validate(input: SEOInput): {
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
    execute(input: SEOInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<SEOPackage>;
}
export {};
//# sourceMappingURL=seo-agent.d.ts.map