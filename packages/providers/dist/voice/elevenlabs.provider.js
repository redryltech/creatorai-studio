// ============================================================
// CreatorAI Studio — ElevenLabs Voice Provider
// ============================================================
// Implements IVoiceProvider against the ElevenLabs TTS API.
//
// ElevenLabs offers the highest quality AI voices currently
// available, with 30+ languages and emotional control.
//
// The response is a raw audio stream (mp3 by default).
// We return both the audio buffer and a URL after upload
// to Firebase Storage.
// ============================================================
import { BaseProvider } from '../core/base-provider';
const DEFAULT_MODEL = 'eleven_multilingual_v2';
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // "Adam" — clear male narration
/**
 * Common voice presets for quick access.
 * Users can also use custom voice IDs from their ElevenLabs account.
 */
const VOICE_PRESETS = {
    adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', accent: 'American' },
    rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', accent: 'American' },
    domi: { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', accent: 'American' },
    bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', accent: 'American' },
    josh: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', accent: 'American' },
    arnold: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', accent: 'American' },
    sam: { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', accent: 'American' },
};
export class ElevenLabsProvider extends BaseProvider {
    id = 'elevenlabs';
    name = 'ElevenLabs';
    version = '1.0.0';
    constructor(apiKey) {
        super({
            apiKey,
            baseUrl: 'https://api.elevenlabs.io/v1',
            timeoutMs: 60000,
            maxRetries: 2,
        });
    }
    getAuthHeaders() {
        return { 'xi-api-key': this.apiKey };
    }
    async synthesize(req) {
        const voiceId = this.resolveVoiceId(req.voiceId);
        const model = req.model ?? DEFAULT_MODEL;
        const format = req.outputFormat ?? 'mp3';
        // ElevenLabs TTS endpoint returns raw audio bytes
        const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
        const body = {
            text: req.text,
            model_id: model,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
            },
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: `audio/${format}`,
                ...this.getAuthHeaders(),
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs TTS error ${response.status}: ${errorText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);
        // Estimate duration from file size.
        // MP3 at 128kbps: 1 second ≈ 16KB.
        // This is approximate; actual duration is determined after storage upload.
        const estimatedDuration = audioBuffer.length / 16000;
        return {
            audioUrl: '', // Set by the agent after uploading to Firebase Storage
            audioBuffer,
            duration: estimatedDuration,
            format,
            sizeBytes: audioBuffer.length,
            characterCount: req.text.length,
        };
    }
    async listVoices(language) {
        try {
            const data = await this.request('/voices', {
                method: 'GET',
            });
            let voices = data.voices;
            if (language) {
                voices = voices.filter((v) => v.labels?.language?.toLowerCase() === language.toLowerCase() ||
                    v.labels?.accent?.toLowerCase().includes(language.toLowerCase()));
            }
            return voices.map((v) => ({
                id: v.voice_id,
                name: v.name,
                gender: v.labels?.gender ?? 'neutral',
                language: v.labels?.language ?? 'en',
                accent: v.labels?.accent ?? 'unknown',
                previewUrl: v.preview_url ?? null,
                category: v.category ?? 'general',
            }));
        }
        catch {
            // Fallback to presets if API call fails
            return Object.values(VOICE_PRESETS).map((v) => ({
                id: v.id,
                name: v.name,
                gender: v.gender,
                language: 'en',
                accent: v.accent,
                previewUrl: null,
                category: 'narration',
            }));
        }
    }
    /**
     * Resolve a voice ID from a preset name or return as-is.
     */
    resolveVoiceId(voiceId) {
        const preset = VOICE_PRESETS[voiceId.toLowerCase()];
        return preset ? preset.id : voiceId;
    }
}
//# sourceMappingURL=elevenlabs.provider.js.map