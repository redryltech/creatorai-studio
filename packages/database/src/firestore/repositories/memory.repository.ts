// ============================================================
// CreatorAI Studio — AI Memory & Brand Profile Repositories
// ============================================================

import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { AIMemory, BrandProfile } from '@creatorai/shared';
import { BaseRepository } from './base.repository';

export class AIMemoryRepository extends BaseRepository<AIMemory> {
  constructor(db: Firestore) { super(db, 'aiMemory'); }

  protected fromFirestore(doc: DocumentSnapshot): AIMemory {
    const d = doc.data()!;
    return {
      id: doc.id,
      workspaceId: d.workspaceId, projectId: d.projectId ?? null, userId: d.userId,
      writingStyle: d.writingStyle ?? { tone: 'professional', vocabulary: 'moderate', sentenceLength: 'medium', useEmojis: false, useHashtags: true, persona: '', samplePhrases: [], avoidPhrases: [] },
      audience: d.audience ?? { primaryAge: '18-35', interests: [], painPoints: [], contentPreferences: [], platforms: [], languages: ['en'] },
      contentStrategy: d.contentStrategy ?? { contentPillars: [], postingFrequency: '', bestPerformingTopics: [], contentGoals: [], competitorChannels: [], callToActions: [] },
      promptPresets: d.promptPresets ?? [],
      globalNegativePrompts: d.globalNegativePrompts ?? [],
      customInstructions: d.customInstructions ?? '',
      facts: d.facts ?? [],
      restrictions: d.restrictions ?? [],
      createdAt: d.createdAt?.toDate() ?? new Date(),
      updatedAt: d.updatedAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<AIMemory>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /** Get workspace-level memory. */
  async getWorkspaceMemory(workspaceId: string): Promise<AIMemory | null> {
    const snap = await this.collection
      .where('workspaceId', '==', workspaceId)
      .where('projectId', '==', null)
      .limit(1).get();
    if (snap.empty) return null;
    return this.fromFirestore(snap.docs[0]!);
  }

  /** Get project-level memory. */
  async getProjectMemory(workspaceId: string, projectId: string): Promise<AIMemory | null> {
    const snap = await this.collection
      .where('workspaceId', '==', workspaceId)
      .where('projectId', '==', projectId)
      .limit(1).get();
    if (snap.empty) return null;
    return this.fromFirestore(snap.docs[0]!);
  }
}

export class BrandProfileRepository extends BaseRepository<BrandProfile> {
  constructor(db: Firestore) { super(db, 'brandProfiles'); }

  protected fromFirestore(doc: DocumentSnapshot): BrandProfile {
    const d = doc.data()!;
    return {
      id: doc.id,
      workspaceId: d.workspaceId, userId: d.userId,
      name: d.name, description: d.description ?? '',
      identity: d.identity ?? { brandName: '', tagline: '', mission: '', values: [], industry: '', website: null, logoUrl: null },
      visualStyle: d.visualStyle ?? { primaryColor: '#4263eb', secondaryColor: '#748ffc', accentColor: '#f59f00', fontFamily: null, artStyle: null, imageStyle: '', thumbnailStyle: '' },
      voiceTone: d.voiceTone ?? { tone: 'professional', personality: [], preferredVoiceId: null, languageStyle: '', sampleScript: null },
      contentRules: d.contentRules ?? { mustInclude: [], mustAvoid: [], hashtagSets: {}, ctaTemplates: [], keywordDensity: [], forbiddenWords: [] },
      isDefault: d.isDefault ?? false,
      createdAt: d.createdAt?.toDate() ?? new Date(),
      updatedAt: d.updatedAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<BrandProfile>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findByWorkspace(workspaceId: string): Promise<BrandProfile[]> {
    return this.findByField('workspaceId', workspaceId, 'name', 'asc');
  }

  async getDefaultBrand(workspaceId: string): Promise<BrandProfile | null> {
    const snap = await this.collection
      .where('workspaceId', '==', workspaceId)
      .where('isDefault', '==', true)
      .limit(1).get();
    if (snap.empty) return null;
    return this.fromFirestore(snap.docs[0]!);
  }
}
