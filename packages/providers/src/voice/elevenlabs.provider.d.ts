import { BaseProvider } from '../core/base-provider';
import type { IVoiceProvider, VoiceSynthesisRequest, VoiceSynthesisResponse, VoiceOption } from '../core/provider.interface';
export declare class ElevenLabsProvider extends BaseProvider implements IVoiceProvider {
    readonly id = "elevenlabs";
    readonly name = "ElevenLabs";
    readonly version = "1.0.0";
    constructor(apiKey: string);
    protected getAuthHeaders(): Record<string, string>;
    synthesize(req: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse>;
    listVoices(language?: string): Promise<VoiceOption[]>;
    /**
     * Resolve a voice ID from a preset name or return as-is.
     */
    private resolveVoiceId;
}
//# sourceMappingURL=elevenlabs.provider.d.ts.map