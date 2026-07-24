// ============================================================
// CreatorAI Studio — Prompt Manager
// ============================================================
// Centralizes all prompt template management.
//
// Why this matters:
// - Prompts are the most-iterated artifact in an AI system
// - Hardcoding prompts inside agents makes A/B testing impossible
// - We need version tracking to correlate prompt changes with output quality
// - Templates with variables enable reuse across content types
//
// Every agent calls promptManager.render('template-id', variables)
// instead of constructing prompts inline.
// ============================================================

import type { PromptTemplate, RenderedPrompt } from '@creatorai/shared';
import { Logger } from '../logger';

const log = Logger.for('PromptManager');

/**
 * Variable interpolation regex: matches {{variableName}}
 */
const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

/**
 * In-memory prompt template store.
 * In production, these would be loaded from Firestore or a config file
 * and hot-reloadable without server restart.
 */
export class PromptManager {
  private static instance: PromptManager | null = null;
  private templates: Map<string, PromptTemplate> = new Map();

  private constructor() {}

  static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  static resetInstance(): void {
    PromptManager.instance = null;
  }

  /**
   * Register a prompt template.
   */
  register(template: PromptTemplate): void {
    const existing = this.templates.get(template.id);
    if (existing && existing.version >= template.version) {
      log.warn('Skipping older prompt template version', {
        templateId: template.id,
        existingVersion: existing.version,
        newVersion: template.version,
      });
      return;
    }

    this.templates.set(template.id, template);
    log.info('Registered prompt template', {
      templateId: template.id,
      version: template.version,
      category: template.category,
    });
  }

  /**
   * Register multiple templates at once.
   */
  registerAll(templates: PromptTemplate[]): void {
    for (const t of templates) {
      this.register(t);
    }
  }

  /**
   * Render a prompt template with the given variables.
   *
   * @param templateId - Template identifier
   * @param variables - Key-value map of template variables
   * @param overrides - Optional overrides for model, temperature, etc.
   * @returns Fully rendered prompt ready for LLM call
   * @throws Error if template not found or required variables missing
   */
  render(
    templateId: string,
    variables: Record<string, string>,
    overrides: Partial<Pick<RenderedPrompt, 'model' | 'temperature' | 'maxTokens'>> = {},
  ): RenderedPrompt {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(
        `Prompt template "${templateId}" not found. Available: ${this.listIds().join(', ')}`,
      );
    }

    // Validate all required variables are provided
    const missingVars = template.variables.filter((v) => !(v in variables));
    if (missingVars.length > 0) {
      throw new Error(
        `Missing variables for template "${templateId}": ${missingVars.join(', ')}`,
      );
    }

    // Interpolate variables into system and user prompts
    const systemPrompt = this.interpolate(template.systemPrompt, variables);
    const userPrompt = this.interpolate(template.userPromptTemplate, variables);

    return {
      templateId: template.id,
      templateVersion: template.version,
      systemPrompt,
      userPrompt,
      model: overrides.model ?? template.model ?? 'gpt-4o',
      temperature: overrides.temperature ?? template.temperature,
      maxTokens: overrides.maxTokens ?? template.maxTokens,
      responseFormat: template.responseFormat,
    };
  }

  /**
   * Get a template by ID (for inspection/editing).
   */
  get(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List all registered template IDs.
   */
  listIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * List templates by category.
   */
  listByCategory(category: string): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category,
    );
  }

  /**
   * Check if a template exists.
   */
  has(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  /**
   * Get the count of registered templates.
   */
  get size(): number {
    return this.templates.size;
  }

  // ---- Private ----

  private interpolate(
    template: string,
    variables: Record<string, string>,
  ): string {
    return template.replace(VARIABLE_REGEX, (match, varName: string) => {
      if (varName in variables) {
        return variables[varName]!;
      }
      // Leave unmatched variables as-is (they might be intentional)
      return match;
    });
  }
}
