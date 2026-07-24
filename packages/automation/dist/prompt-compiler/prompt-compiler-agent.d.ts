import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { CompiledPromptPackage, PromptLength } from './prompt.types';
export interface PromptCompilerInput {
    request: Record<string, unknown>;
    directorPlan: DirectorPlan;
    storyboard: Storyboard;
    characterDatabase: CharacterDatabase;
    sceneGraphPackage: SceneGraphPackage;
    worldStatePackage: WorldStatePackage;
    assetMemoryPackage: AssetMemoryPackage;
    promptLength?: PromptLength;
}
export declare class PromptCompilerAgent implements IAutomationAgent<PromptCompilerInput, CompiledPromptPackage> {
    readonly agentId = "automation.prompt_compiler";
    readonly agentName = "AI Prompt Compiler";
    readonly stage: AutomationStage;
    validate(input: PromptCompilerInput): {
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
    execute(input: PromptCompilerInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CompiledPromptPackage>;
}
//# sourceMappingURL=prompt-compiler-agent.d.ts.map