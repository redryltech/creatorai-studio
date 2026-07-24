import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { Transition } from '../types/video-production.types';
interface TransitionInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    defaultDurationMs?: number;
}
export declare class TransitionEngineAgent implements IAutomationAgent<TransitionInput, Transition[]> {
    readonly agentId = "automation.transitions";
    readonly agentName = "Transition Engine";
    readonly stage = "transitions";
    validate(input: TransitionInput): {
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
    execute(input: TransitionInput, onProgress: ProgressCallback, _cancellation: CancellationToken): Promise<Transition[]>;
}
export {};
//# sourceMappingURL=transition-engine.d.ts.map