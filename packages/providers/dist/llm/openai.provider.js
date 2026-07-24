// ============================================================
// CreatorAI Studio — OpenAI LLM Provider
// ============================================================
// Real implementation against the OpenAI Chat Completions API.
// Supports GPT-4o, GPT-4.1, GPT-4o-mini, and future models.
//
// All AI agents call this through the ILLMProvider interface.
// No agent ever calls OpenAI directly.
//
// Features:
//   ✅ Blocking completions (JSON mode, structured output)
//   ✅ Streaming completions (token-by-token for chat UI)
//   ✅ Retry with exponential backoff (via BaseProvider)
//   ✅ Circuit breaker integration (via setCircuitBreaker)
//   ✅ Timeout handling
//   ✅ Rate limit header tracking
//   ✅ Cost tracking (agents call CostTracker after each call)
//   ✅ Cancellation support (via AbortController)
// ============================================================
import { BaseProvider } from '../core/base-provider';
export class OpenAIProvider extends BaseProvider {
    id = 'openai';
    name = 'OpenAI';
    version = '2.0.0';
    defaultModel;
    constructor(config) {
        const cfg = typeof config === 'string'
            ? { apiKey: config }
            : config;
        super({
            apiKey: cfg.apiKey,
            baseUrl: cfg.baseUrl ?? 'https://api.openai.com/v1',
            timeoutMs: cfg.timeoutMs ?? 120000,
            maxRetries: cfg.maxRetries ?? 2,
        });
        this.defaultModel = cfg.defaultModel ?? 'gpt-4o';
    }
    /**
     * Generate a complete text response (non-streaming).
     * Used for script generation, prompt optimization, SEO,
     * research synthesis, content planning — any task that
     * needs the full output before proceeding.
     */
    async complete(req) {
        const model = req.model ?? this.defaultModel;
        const body = {
            model,
            messages: [
                { role: 'system', content: req.systemPrompt },
                ...req.messages,
            ],
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
        };
        if (req.topP !== undefined) {
            body.top_p = req.topP;
        }
        if (req.responseFormat === 'json') {
            body.response_format = { type: 'json_object' };
        }
        const data = await this.request('/chat/completions', {
            body,
        });
        const choice = data.choices[0];
        if (!choice) {
            throw new Error('OpenAI returned no choices');
        }
        return {
            content: choice.message.content ?? '',
            model: data.model,
            usage: {
                inputTokens: data.usage.prompt_tokens,
                outputTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
            finishReason: this.mapFinishReason(choice.finish_reason),
        };
    }
    /**
     * Stream a text response token by token.
     * Used for the AI chat interface.
     */
    async *completeStream(req) {
        const model = req.model ?? this.defaultModel;
        const body = {
            model,
            messages: [
                { role: 'system', content: req.systemPrompt },
                ...req.messages,
            ],
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            stream: true,
        };
        if (req.topP !== undefined)
            body.top_p = req.topP;
        const url = `${this.baseUrl}/chat/completions`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders(),
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI streaming error ${response.status}: ${errorText}`);
            }
            if (!response.body) {
                throw new Error('OpenAI streaming response has no body');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') {
                            if (trimmed === 'data: [DONE]') {
                                yield { content: '', done: true };
                                return;
                            }
                            continue;
                        }
                        if (!trimmed.startsWith('data: '))
                            continue;
                        try {
                            const json = JSON.parse(trimmed.slice(6));
                            const delta = json.choices?.[0]?.delta?.content;
                            if (delta) {
                                yield { content: delta, done: false };
                            }
                        }
                        catch {
                            // Malformed chunk — skip
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    /**
     * Get the default model this provider is configured with.
     */
    getDefaultModel() {
        return this.defaultModel;
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'stop': return 'stop';
            case 'length': return 'length';
            case 'content_filter': return 'content_filter';
            default: return 'stop';
        }
    }
}
//# sourceMappingURL=openai.provider.js.map