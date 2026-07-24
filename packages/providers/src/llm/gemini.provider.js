// ============================================================
// CreatorAI Studio — Google Gemini LLM Provider (Free Tier)
// ============================================================
// Implements ILLMProvider using the Gemini API free tier.
// 15 RPM, 1M tokens/day — sufficient for development.
//
// API: https://generativelanguage.googleapis.com/v1beta
// Free key: https://aistudio.google.com/apikey
//
// Drop-in replacement for OpenAI — same ILLMProvider interface.
// Switch by setting GEMINI_API_KEY in .env.local.
// ============================================================
import { BaseProvider } from '../core/base-provider';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
// Model fallback chain — try best available, fall back to lighter models
const MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
];
export class GeminiProvider extends BaseProvider {
    id = 'gemini';
    name = 'Google Gemini (Free)';
    version = '1.0.0';
    defaultModel;
    constructor(config) {
        super({
            apiKey: config.apiKey,
            baseUrl: API_BASE,
            timeoutMs: config.timeoutMs ?? 120000,
            maxRetries: 2,
        });
        this.defaultModel = config.defaultModel ?? DEFAULT_MODEL;
    }
    getAuthHeaders() {
        return {}; // Gemini uses query param auth, not header
    }
    async complete(req) {
        const requestedModel = req.model ?? this.defaultModel;
        // Build the model fallback list: requested model first, then fallback chain
        const modelsToTry = [requestedModel, ...MODEL_FALLBACK_CHAIN.filter(m => m !== requestedModel)];
        // Build Gemini request format
        const contents = [];
        // System instruction goes as a separate field in Gemini
        const systemInstruction = req.systemPrompt;
        // Convert messages to Gemini format
        for (const msg of req.messages) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }
        const body = {
            contents,
            generationConfig: {
                temperature: req.temperature ?? 0.7,
                maxOutputTokens: req.maxTokens ?? 4096,
                topP: req.topP ?? 0.95,
            },
        };
        // Only add system instruction if provided
        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        if (req.responseFormat === 'json') {
            body.generationConfig.responseMimeType = 'application/json';
        }
        let lastError = null;
        for (const model of modelsToTry) {
            try {
                const url = `/models/${model}:generateContent?key=${this.apiKey}`;
                const response = await fetch(`${API_BASE}${url}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(this.timeoutMs),
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    const status = response.status;
                    // If quota exceeded (429) or model not found (404), try next model
                    if (status === 429 || status === 404) {
                        console.warn(`[Gemini] Model ${model} returned ${status}, trying next fallback...`);
                        lastError = new Error(`Gemini model ${model} error ${status}: ${errorText.substring(0, 200)}`);
                        continue;
                    }
                    throw new Error(`Gemini API error ${status}: ${errorText}`);
                }
                const data = (await response.json());
                const candidate = data.candidates?.[0];
                if (!candidate) {
                    throw new Error('Gemini returned no candidates');
                }
                const content = candidate.content?.parts?.map((p) => p.text).join('') ?? '';
                const usage = data.usageMetadata ?? { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
                if (model !== requestedModel) {
                    console.log(`[Gemini] ✅ Used fallback model: ${model} (requested: ${requestedModel})`);
                }
                return {
                    content,
                    model,
                    usage: {
                        inputTokens: usage.promptTokenCount ?? 0,
                        outputTokens: usage.candidatesTokenCount ?? 0,
                        totalTokens: usage.totalTokenCount ?? 0,
                    },
                    finishReason: candidate.finishReason === 'STOP' ? 'stop' : candidate.finishReason === 'MAX_TOKENS' ? 'length' : 'stop',
                };
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                // Only continue to next model for quota/not-found errors
                if (lastError.message.includes('429') || lastError.message.includes('404') || lastError.message.includes('quota')) {
                    console.warn(`[Gemini] Model ${model} failed: ${lastError.message.substring(0, 100)}, trying next...`);
                    continue;
                }
                throw lastError;
            }
        }
        throw lastError ?? new Error('All Gemini models exhausted');
    }
    async *completeStream(req) {
        // For dev mode, use non-streaming and yield all at once
        const response = await this.complete(req);
        yield { content: response.content, done: true };
    }
}
//# sourceMappingURL=gemini.provider.js.map