// ============================================================
// CreatorAI Studio — Publish History Manager
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { PublishHistoryEntry, SocialPlatformId } from '../types/publishing.types';

const log = Logger.for('PublishHistory');

export class PublishHistory {
  private static instance: PublishHistory | null = null;
  private entries: PublishHistoryEntry[] = [];

  private constructor() {}
  static getInstance(): PublishHistory { if (!PublishHistory.instance) PublishHistory.instance = new PublishHistory(); return PublishHistory.instance; }
  static resetInstance(): void { PublishHistory.instance = null; }

  record(entry: Omit<PublishHistoryEntry, 'id'>): PublishHistoryEntry {
    const full: PublishHistoryEntry = { id: generateId(ID_PREFIXES.step), ...entry };
    this.entries.push(full);
    log.info('Publish recorded', { platform: entry.platform, url: entry.platformUrl, status: entry.status });
    return full;
  }

  getByUser(userId: string, limit: number = 50): PublishHistoryEntry[] {
    return this.entries.filter((e) => e.userId === userId).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, limit);
  }

  getByProject(projectId: string): PublishHistoryEntry[] {
    return this.entries.filter((e) => e.projectId === projectId).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  getByPlatform(userId: string, platform: SocialPlatformId): PublishHistoryEntry[] {
    return this.entries.filter((e) => e.userId === userId && e.platform === platform);
  }

  get totalPublished(): number { return this.entries.filter((e) => e.status === 'published').length; }
}
