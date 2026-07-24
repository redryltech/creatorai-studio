// ============================================================
// CreatorAI Studio — AI Memory & Brand Service
// ============================================================

import type { AIMemory, BrandProfile, MergedMemoryContext } from '@creatorai/shared';
import { generateId, ID_PREFIXES, NotFoundError, Permission } from '@creatorai/shared';
import type { AIMemoryRepository, BrandProfileRepository } from '@creatorai/database';
import { MemoryLoader } from '@creatorai/agents';
import { Logger } from '@creatorai/agents';
import type { WorkspaceService } from './workspace.service';

const log = Logger.for('MemoryService');

export class MemoryService {
  constructor(
    private readonly memoryRepo: AIMemoryRepository,
    private readonly brandRepo: BrandProfileRepository,
    private readonly workspaceService: WorkspaceService,
  ) {
    // Wire the MemoryLoader's data source to our repositories
    MemoryLoader.setDataSource({
      getWorkspaceMemory: (wId) => this.memoryRepo.getWorkspaceMemory(wId),
      getProjectMemory: (wId, pId) => this.memoryRepo.getProjectMemory(wId, pId),
      getDefaultBrand: (wId) => this.brandRepo.getDefaultBrand(wId),
      getBrandById: (bId) => this.brandRepo.findById(bId),
    });
    log.info('MemoryLoader data source connected');
  }

  // ---- AI Memory ----

  async getWorkspaceMemory(workspaceId: string, userId: string): Promise<AIMemory | null> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.MEMORY_VIEW);
    return this.memoryRepo.getWorkspaceMemory(workspaceId);
  }

  async upsertWorkspaceMemory(workspaceId: string, userId: string, data: Partial<AIMemory>): Promise<AIMemory> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.MEMORY_EDIT);

    let existing = await this.memoryRepo.getWorkspaceMemory(workspaceId);

    if (existing) {
      await this.memoryRepo.update(existing.id, { ...data, userId, updatedAt: new Date() } as Partial<AIMemory>);
      return { ...existing, ...data, userId, updatedAt: new Date() };
    }

    const memory: AIMemory = {
      id: generateId(ID_PREFIXES.step),
      workspaceId,
      projectId: null,
      userId,
      writingStyle: data.writingStyle ?? { tone: 'professional', vocabulary: 'moderate', sentenceLength: 'medium', useEmojis: false, useHashtags: true, persona: '', samplePhrases: [], avoidPhrases: [] },
      audience: data.audience ?? { primaryAge: '18-35', interests: [], painPoints: [], contentPreferences: [], platforms: [], languages: ['en'] },
      contentStrategy: data.contentStrategy ?? { contentPillars: [], postingFrequency: '', bestPerformingTopics: [], contentGoals: [], competitorChannels: [], callToActions: [] },
      promptPresets: data.promptPresets ?? [],
      globalNegativePrompts: data.globalNegativePrompts ?? [],
      customInstructions: data.customInstructions ?? '',
      facts: data.facts ?? [],
      restrictions: data.restrictions ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.memoryRepo.create(memory);
    log.info('Workspace memory created', { workspaceId });
    return memory;
  }

  async getProjectMemory(workspaceId: string, projectId: string, userId: string): Promise<AIMemory | null> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.MEMORY_VIEW);
    return this.memoryRepo.getProjectMemory(workspaceId, projectId);
  }

  /** Load merged memory context for agent execution. */
  async loadMergedContext(workspaceId: string, projectId?: string, brandProfileId?: string): Promise<MergedMemoryContext> {
    return MemoryLoader.load(workspaceId, projectId, brandProfileId);
  }

  // ---- Brand Profiles ----

  async listBrands(workspaceId: string, userId: string): Promise<BrandProfile[]> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.BRAND_VIEW);
    return this.brandRepo.findByWorkspace(workspaceId);
  }

  async getBrand(brandId: string, userId: string): Promise<BrandProfile> {
    const brand = await this.brandRepo.findById(brandId);
    if (!brand) throw new NotFoundError('BrandProfile', brandId);
    await this.workspaceService.requirePermission(brand.workspaceId, userId, Permission.BRAND_VIEW);
    return brand;
  }

  async createBrand(workspaceId: string, userId: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.BRAND_EDIT);

    const brand: BrandProfile = {
      id: generateId(ID_PREFIXES.step),
      workspaceId,
      userId,
      name: data.name ?? 'Untitled Brand',
      description: data.description ?? '',
      identity: data.identity ?? { brandName: '', tagline: '', mission: '', values: [], industry: '', website: null, logoUrl: null },
      visualStyle: data.visualStyle ?? { primaryColor: '#4263eb', secondaryColor: '#748ffc', accentColor: '#f59f00', fontFamily: null, artStyle: null, imageStyle: '', thumbnailStyle: '' },
      voiceTone: data.voiceTone ?? { tone: 'professional', personality: [], preferredVoiceId: null, languageStyle: '', sampleScript: null },
      contentRules: data.contentRules ?? { mustInclude: [], mustAvoid: [], hashtagSets: {}, ctaTemplates: [], keywordDensity: [], forbiddenWords: [] },
      isDefault: data.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.brandRepo.create(brand);
    log.info('Brand profile created', { brandId: brand.id, workspaceId, name: brand.name });
    return brand;
  }

  async updateBrand(brandId: string, userId: string, data: Partial<BrandProfile>): Promise<void> {
    const brand = await this.getBrand(brandId, userId);
    await this.workspaceService.requirePermission(brand.workspaceId, userId, Permission.BRAND_EDIT);
    await this.brandRepo.update(brandId, { ...data, updatedAt: new Date() } as Partial<BrandProfile>);
  }

  async deleteBrand(brandId: string, userId: string): Promise<void> {
    const brand = await this.getBrand(brandId, userId);
    await this.workspaceService.requirePermission(brand.workspaceId, userId, Permission.BRAND_EDIT);
    await this.brandRepo.delete(brandId);
  }

  async setDefaultBrand(workspaceId: string, brandId: string, userId: string): Promise<void> {
    await this.workspaceService.requirePermission(workspaceId, userId, Permission.BRAND_EDIT);
    // Unset current default
    const brands = await this.brandRepo.findByWorkspace(workspaceId);
    for (const b of brands) {
      if (b.isDefault) await this.brandRepo.update(b.id, { isDefault: false } as Partial<BrandProfile>);
    }
    await this.brandRepo.update(brandId, { isDefault: true } as Partial<BrandProfile>);
  }
}
