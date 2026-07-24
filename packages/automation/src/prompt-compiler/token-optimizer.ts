// ============================================================
// CreatorAI Studio — Token Optimizer
// ============================================================

import type { PromptLength } from './prompt.types';

const LENGTH_TARGETS: Record<PromptLength, number> = {
  short: 50,
  balanced: 120,
  detailed: 250,
  maximum_quality: 500,
};

export class TokenOptimizer {
  /**
   * Optimize prompt text to fit within a token limit while
   * preserving the most important information.
   */
  static optimize(prompt: string, maxTokens: number, length: PromptLength): string {
    const targetWords = Math.min(LENGTH_TARGETS[length], Math.floor(maxTokens / 1.3));
    const words = prompt.split(/\s+/).filter(Boolean);

    if (words.length <= targetWords) return prompt;

    // Truncate by removing lowest-priority content from the end
    // while preserving commas as segment boundaries
    const segments = prompt.split(',').map((s) => s.trim()).filter(Boolean);

    if (length === 'short') {
      // Keep only first 4 segments
      return segments.slice(0, Math.min(4, segments.length)).join(', ');
    }

    if (length === 'balanced') {
      // Keep first 8 segments
      return segments.slice(0, Math.min(8, segments.length)).join(', ');
    }

    // Detailed / maximum: trim from end until under limit
    let result = prompt;
    while (result.split(/\s+/).length > targetWords && segments.length > 3) {
      segments.pop();
      result = segments.join(', ');
    }

    return result;
  }

  /** Estimate token count for a prompt string. */
  static estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  /** Estimate cost for a provider. */
  static estimateCost(tokenCount: number, costPerUnit: number): number {
    return Math.round(tokenCount * costPerUnit * 100) / 100;
  }
}
