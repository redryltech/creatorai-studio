// ============================================================
// CreatorAI Studio — Prompt Evolution Engine
// ============================================================
// Versions and improves prompts based on content performance.
// Never overwrites — always creates a new version.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { PromptVersion, LearningMemory } from '../types/intelligence.types';

const log = Logger.for('PromptEvolution');

export class PromptEvolutionEngine {
  private static instance: PromptEvolutionEngine | null = null;
  private versions: PromptVersion[] = [];

  private constructor() {}
  static getInstance(): PromptEvolutionEngine { if (!PromptEvolutionEngine.instance) PromptEvolutionEngine.instance = new PromptEvolutionEngine(); return PromptEvolutionEngine.instance; }
  static resetInstance(): void { PromptEvolutionEngine.instance = null; }

  /** Record a prompt version with its performance. */
  recordVersion(params: { userId: string; promptType: PromptVersion['promptType']; prompt: string; performanceScore?: number }): PromptVersion {
    const existing = this.versions.filter((v) => v.userId === params.userId && v.promptType === params.promptType);
    const version: PromptVersion = {
      id: generateId(ID_PREFIXES.step),
      userId: params.userId,
      promptType: params.promptType,
      version: existing.length + 1,
      prompt: params.prompt,
      performanceScore: params.performanceScore ?? null,
      usageCount: 1,
      averageContentScore: params.performanceScore ?? null,
      createdAt: new Date(),
      metadata: {},
    };
    this.versions.push(version);
    log.info('Prompt version recorded', { type: params.promptType, version: version.version });
    return version;
  }

  /** Evolve a prompt using learning patterns. */
  async evolvePrompt(userId: string, promptType: PromptVersion['promptType'], currentPrompt: string, learnings: LearningMemory[]): Promise<PromptVersion> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider');

    const relevantLearnings = learnings.filter((l) => l.confidence > 0.5).slice(0, 10);

    const response = await llm.complete({
      systemPrompt: 'You are a prompt engineer. Improve the given prompt based on performance data. Return ONLY the improved prompt text, nothing else.',
      messages: [{ role: 'user', content: `Improve this ${promptType} prompt based on what works:

Current prompt:
${currentPrompt}

Learned patterns (sorted by effectiveness):
${relevantLearnings.map((l) => `- ${l.category}: ${l.pattern} (score: ${l.score})`).join('\n')}

Return the improved prompt:` }],
      temperature: 0.5, maxTokens: 2048,
    });

    CostTracker.getInstance().trackLLMUsage({
      userId, projectId: null, pipelineId: null,
      agentId: 'prompt_evolution', providerId: llm.id, model: response.model, tokens: response.usage,
    });

    return this.recordVersion({ userId, promptType, prompt: response.content.trim() });
  }

  /** Get the best-performing version of a prompt type. */
  getBestVersion(userId: string, promptType: PromptVersion['promptType']): PromptVersion | undefined {
    return this.versions
      .filter((v) => v.userId === userId && v.promptType === promptType && v.performanceScore !== null)
      .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))[0];
  }

  /** Get version history. */
  getHistory(userId: string, promptType: PromptVersion['promptType']): PromptVersion[] {
    return this.versions.filter((v) => v.userId === userId && v.promptType === promptType).sort((a, b) => b.version - a.version);
  }

  /** Update performance score after analytics come in. */
  updatePerformance(versionId: string, score: number): void {
    const v = this.versions.find((ver) => ver.id === versionId);
    if (v) { v.performanceScore = score; v.usageCount++; v.averageContentScore = score; }
  }
}
