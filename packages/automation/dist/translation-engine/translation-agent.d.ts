import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { TranslationPackage, SupportedLanguage } from './translation.types';
export interface TranslationInput {
    request: Record<string, unknown>;
    scenes: Array<{
        id: string;
        order: number;
        narration: string;
    }>;
    title: string;
    targetLanguages: SupportedLanguage[];
    sourceLanguage?: SupportedLanguage;
}
export declare class TranslationAgent implements IAutomationAgent<TranslationInput, TranslationPackage> {
    readonly agentId = "automation.translation";
    readonly agentName = "AI Translation Engine";
    readonly stage: AutomationStage;
    validate(input: TranslationInput): {
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
    execute(input: TranslationInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<TranslationPackage>;
}
//# sourceMappingURL=translation-agent.d.ts.map