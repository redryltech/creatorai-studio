// ============================================================
// CreatorAI Studio — Director Memory
// ============================================================
// Stores past director decisions for future learning.
// The AI Director improves over time by remembering which
// cinematic choices led to better results.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { DirectorMemory, DirectorMemoryEntry, CameraStyle, LightingType, ColorGradingStyle } from './director.types';

const log = Logger.for('DirectorMemory');

const MAX_ENTRIES = 500;

export class DirectorMemoryStore {
  private static instance: DirectorMemoryStore | null = null;
  private memory: DirectorMemory;

  private constructor() {
    this.memory = {
      entries: [],
      maxEntries: MAX_ENTRIES,
      version: '1.0.0',
    };
  }

  static getInstance(): DirectorMemoryStore {
    if (!DirectorMemoryStore.instance) {
      DirectorMemoryStore.instance = new DirectorMemoryStore();
    }
    return DirectorMemoryStore.instance;
  }

  static resetInstance(): void { DirectorMemoryStore.instance = null; }

  /**
   * Record a director decision for future reference.
   */
  record(input: {
    topic: string;
    planId: string;
    decisions: {
      preset: string;
      colorGrading: ColorGradingStyle;
      pacing: string;
      cameraStyles: CameraStyle[];
      lighting: LightingType[];
    };
  }): void {
    const entry: DirectorMemoryEntry = {
      id: generateId(ID_PREFIXES.asset),
      topic: input.topic,
      planId: input.planId,
      decisions: input.decisions,
      performance: {
        qualityScore: 0,
        viewCount: null,
        engagement: null,
      },
      createdAt: new Date().toISOString(),
    };

    this.memory.entries.push(entry);

    // Trim if over limit (keep recent)
    if (this.memory.entries.length > MAX_ENTRIES) {
      this.memory.entries = this.memory.entries.slice(-MAX_ENTRIES);
    }

    log.debug('Director decision recorded', { topic: input.topic.slice(0, 40), planId: input.planId });
  }

  /**
   * Update performance metrics for a past decision.
   */
  updatePerformance(planId: string, performance: { qualityScore?: number; viewCount?: number; engagement?: number }): void {
    const entry = this.memory.entries.find((e) => e.planId === planId);
    if (entry) {
      if (performance.qualityScore !== undefined) entry.performance.qualityScore = performance.qualityScore;
      if (performance.viewCount !== undefined) entry.performance.viewCount = performance.viewCount;
      if (performance.engagement !== undefined) entry.performance.engagement = performance.engagement;
    }
  }

  /**
   * Get past decisions for similar topics.
   */
  findSimilar(topic: string, limit = 5): DirectorMemoryEntry[] {
    const topicWords = topic.toLowerCase().split(/\s+/);
    return this.memory.entries
      .map((entry) => {
        const entryWords = entry.topic.toLowerCase().split(/\s+/);
        const overlap = topicWords.filter((w) => entryWords.some((ew) => ew.includes(w) || w.includes(ew))).length;
        return { entry, score: overlap };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.entry);
  }

  /**
   * Get the most successful color grading across all entries.
   */
  getBestColorGrading(): ColorGradingStyle | null {
    const scores = new Map<ColorGradingStyle, number>();
    for (const entry of this.memory.entries) {
      if (entry.performance.qualityScore > 0) {
        const current = scores.get(entry.decisions.colorGrading) ?? 0;
        scores.set(entry.decisions.colorGrading, current + entry.performance.qualityScore);
      }
    }
    if (scores.size === 0) return null;
    return [...scores.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  }

  /** Get all entries. */
  getAll(): DirectorMemoryEntry[] { return [...this.memory.entries]; }

  /** Get entry count. */
  get size(): number { return this.memory.entries.length; }
}
