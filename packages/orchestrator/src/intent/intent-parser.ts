// ============================================================
// CreatorAI Studio — Intent Parser
// ============================================================
// Converts natural language into a strongly typed ParsedIntent.
//
// Architecture:
//   User message → LLM (low temperature, JSON mode) → ParsedIntent
//
// The parser is intentionally stateless. Conversation history
// is handled by the Conversation Orchestrator; the parser sees
// only the current message (plus optional context summary).
//
// Why use an LLM instead of regex/NLP?
// - Users speak naturally: "make me 10 shorts about AI" needs
//   semantic understanding, not pattern matching
// - New actions are added by updating the prompt, not code
// - Multilingual support is free (the LLM handles it)
// - Edge cases ("create something cool about dogs for TikTok
//   and YouTube") are resolved by intelligence, not rules
// ============================================================

import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import { PromptManager, Logger, CostTracker } from '@creatorai/agents';
import type { ParsedIntent, IntentEntities } from './intent.types';
import { IntentAction, DEFAULT_ENTITIES } from './intent.types';

const log = Logger.for('IntentParser');

export class IntentParser {
  private readonly promptManager: PromptManager;
  private readonly costTracker: CostTracker;

  constructor() {
    this.promptManager = PromptManager.getInstance();
    this.costTracker = CostTracker.getInstance();
  }

  /**
   * Parse a user message into a structured intent.
   *
   * @param message — Raw user message
   * @param userId — For cost tracking
   * @returns Strongly typed ParsedIntent
   */
  async parse(message: string, userId: string): Promise<ParsedIntent> {
    const trimmed = message.trim();

    // Fast path: empty or very short messages
    if (trimmed.length < 2) {
      return this.createGeneralChatIntent(trimmed);
    }

    log.info('Parsing intent', { messageLength: trimmed.length, userId });

    // Render prompt template
    const rendered = this.promptManager.render('orchestrator.intent_parser', {
      message: trimmed,
    });

    // Get LLM provider
    const providerRegistry = ProviderRegistry.getInstance();
    const llm = await providerRegistry.getPrimary<ILLMProvider>('llm');

    if (!llm) {
      log.warn('No LLM provider available, falling back to general_chat');
      return this.createGeneralChatIntent(trimmed);
    }

    try {
      const response = await llm.complete({
        systemPrompt: rendered.systemPrompt,
        messages: [{ role: 'user', content: rendered.userPrompt }],
        model: rendered.model,
        temperature: rendered.temperature,
        maxTokens: rendered.maxTokens,
        responseFormat: rendered.responseFormat,
      });

      // Track cost
      this.costTracker.trackLLMUsage({
        userId,
        projectId: null,
        pipelineId: null,
        agentId: 'intent_parser',
        providerId: llm.id,
        model: response.model,
        tokens: response.usage,
      });

      // Parse LLM output
      const parsed = JSON.parse(response.content);
      return this.normalize(parsed, trimmed);
    } catch (error) {
      log.error('Intent parsing failed, falling back to general_chat', {}, error as Error);
      return this.createGeneralChatIntent(trimmed);
    }
  }

  /**
   * Normalize and validate the raw LLM output into our ParsedIntent type.
   * Handles common LLM quirks: wrong field names, missing fields, invalid enums.
   */
  private normalize(raw: any, originalMessage: string): ParsedIntent {
    // Validate action
    const action = this.resolveAction(raw.action);

    // Normalize entities
    const entities: IntentEntities = {
      topic: raw.entities?.topic ?? DEFAULT_ENTITIES.topic,
      count: this.clampInt(raw.entities?.count, 1, 100),
      contentType: raw.entities?.contentType ?? raw.entities?.content_type ?? DEFAULT_ENTITIES.contentType,
      platform: raw.entities?.platform ?? DEFAULT_ENTITIES.platform,
      format: raw.entities?.format ?? DEFAULT_ENTITIES.format,
      style: raw.entities?.style ?? DEFAULT_ENTITIES.style,
      tone: raw.entities?.tone ?? DEFAULT_ENTITIES.tone,
      duration: raw.entities?.duration != null ? this.clampInt(raw.entities.duration, 5, 3600) : null,
      language: raw.entities?.language ?? DEFAULT_ENTITIES.language,
      voiceId: raw.entities?.voiceId ?? raw.entities?.voice_id ?? DEFAULT_ENTITIES.voiceId,
      artStyle: raw.entities?.artStyle ?? raw.entities?.art_style ?? DEFAULT_ENTITIES.artStyle,
      scheduleDate: raw.entities?.scheduleDate ?? raw.entities?.schedule_date ?? DEFAULT_ENTITIES.scheduleDate,
      projectId: raw.entities?.projectId ?? raw.entities?.project_id ?? DEFAULT_ENTITIES.projectId,
      priority: this.resolvePriority(raw.entities?.priority),
      additionalInstructions: raw.entities?.additionalInstructions ?? raw.entities?.additional_instructions ?? null,
    };

    // Determine missing required fields
    const missingRequired: string[] = raw.missingRequired ?? [];
    if (this.isCreationAction(action) && !entities.topic) {
      if (!missingRequired.includes('topic')) missingRequired.push('topic');
    }

    const confidence = typeof raw.confidence === 'number'
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.5;

    // Never force clarification for casual chat — low confidence there should
    // still get a conversational reply, not the generic "more details" loop.
    const requiresClarification = action !== IntentAction.GENERAL_CHAT && (
      raw.requiresClarification === true
      || confidence < 0.6
      || (this.isCreationAction(action) && !entities.topic)
      || missingRequired.length > 0
    );

    const clarificationQuestion = requiresClarification
      ? (raw.clarificationQuestion ?? this.generateClarificationQuestion(action, missingRequired))
      : null;

    log.info('Intent parsed', {
      action,
      confidence: confidence.toFixed(2),
      topic: entities.topic,
      count: entities.count,
      platform: entities.platform,
      requiresClarification,
    });

    return {
      action,
      confidence,
      entities,
      rawMessage: originalMessage,
      missingRequired,
      requiresClarification,
      clarificationQuestion,
    };
  }

  private resolveAction(raw: string | undefined): IntentAction {
    if (!raw) return IntentAction.GENERAL_CHAT;
    const normalized = raw.toLowerCase().trim();
    const found = Object.values(IntentAction).find((a) => a === normalized);
    return found ?? IntentAction.GENERAL_CHAT;
  }

  private resolvePriority(raw: string | undefined): 'low' | 'normal' | 'high' {
    if (raw === 'low' || raw === 'high') return raw;
    return 'normal';
  }

  private clampInt(value: unknown, min: number, max: number): number {
    const num = typeof value === 'number' ? Math.round(value) : parseInt(String(value), 10);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  private isCreationAction(action: IntentAction): boolean {
    return [
      IntentAction.CREATE_VIDEO,
      IntentAction.GENERATE_SCRIPT,
      IntentAction.CREATE_THUMBNAIL,
      IntentAction.GENERATE_IMAGE,
      IntentAction.GENERATE_VOICEOVER,
    ].includes(action);
  }

  private generateClarificationQuestion(action: IntentAction, missing: string[]): string {
    if (missing.includes('topic')) {
      return 'What topic would you like the content to be about?';
    }
    if (missing.includes('platform')) {
      return 'Which platform is this for? (YouTube, TikTok, Instagram, etc.)';
    }
    return 'Could you provide more details about what you\'d like me to create?';
  }

  private createGeneralChatIntent(message: string): ParsedIntent {
    return {
      action: IntentAction.GENERAL_CHAT,
      confidence: 1.0,
      entities: { ...DEFAULT_ENTITIES },
      rawMessage: message,
      missingRequired: [],
      requiresClarification: false,
      clarificationQuestion: null,
    };
  }
}
