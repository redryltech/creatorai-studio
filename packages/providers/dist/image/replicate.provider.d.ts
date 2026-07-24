import { BaseProvider } from '../core/base-provider';
import type { IImageProvider, ImageGenerationRequest, ImageGenerationResponse, ImageModel } from '../core/provider.interface';
export declare class ReplicateImageProvider extends BaseProvider implements IImageProvider {
    readonly id = "replicate";
    readonly name = "Replicate";
    readonly version = "1.0.0";
    constructor(apiKey: string);
    protected getAuthHeaders(): Record<string, string>;
    generate(req: ImageGenerationRequest): Promise<ImageGenerationResponse>;
    listModels(): Promise<ImageModel[]>;
    private createAndPollPrediction;
    private pollPrediction;
}
//# sourceMappingURL=replicate.provider.d.ts.map