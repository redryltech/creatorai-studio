import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { OptimizedPromptPackage, ImagePackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';
interface ImageGenInput {
    request: Record<string, unknown>;
    prompts: OptimizedPromptPackage;
    width?: number;
    height?: number;
}
export declare class ImageGenerationAgent implements IAutomationAgent<ImageGenInput, ImagePackage[]> {
    readonly agentId = "automation.image_gen";
    readonly agentName = "Image Generator";
    readonly stage = AutomationStage.MEDIA;
    validate(input: ImageGenInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: ImageGenInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: ImageGenInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ImagePackage[]>;
}
export {};
//# sourceMappingURL=image-gen-agent.d.ts.map