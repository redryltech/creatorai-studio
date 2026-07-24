// ============================================================
// CreatorAI Studio — Project Service
// ============================================================
// Domain service for project lifecycle management.
// Orchestrates ProjectRepository + TimelineRepository + AssetRepository.
//
// API controllers call this service — never the repositories directly.
// ============================================================

import type { Project, ProjectSettings, TimelineEvent } from '@creatorai/shared';
import {
  ProjectStatus, ContentType, Platform, AspectRatio,
  generateId, ID_PREFIXES, NotFoundError, AuthorizationError,
  TimelineEventType, DEFAULT_PLATFORM_SETTINGS,
} from '@creatorai/shared';
import type { ProjectRepository, TimelineRepository, PaginatedResult, PaginationOptions } from '@creatorai/database';
import { Logger } from '@creatorai/agents';

const log = Logger.for('ProjectService');

export class ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly timelineRepo: TimelineRepository,
  ) {}

  /** Create a new project. */
  async createProject(params: {
    userId: string;
    title: string;
    description?: string;
    contentType: ContentType;
    targetPlatforms: Platform[];
    originalPrompt?: string;
    settings?: Partial<ProjectSettings>;
  }): Promise<Project> {
    const platformSettings = params.targetPlatforms[0]
      ? DEFAULT_PLATFORM_SETTINGS[params.targetPlatforms[0]]
      : undefined;

    const project: Project = {
      id: generateId(ID_PREFIXES.project),
      userId: params.userId,
      title: params.title,
      description: params.description ?? '',
      status: ProjectStatus.DRAFT,
      contentType: params.contentType,
      targetPlatforms: params.targetPlatforms,
      originalPrompt: params.originalPrompt ?? '',
      settings: {
        aspectRatio: params.settings?.aspectRatio ?? platformSettings?.aspectRatio ?? AspectRatio.PORTRAIT,
        duration: params.settings?.duration ?? platformSettings?.duration ?? 60,
        language: params.settings?.language ?? 'en',
        voiceId: params.settings?.voiceId ?? null,
        musicStyle: params.settings?.musicStyle ?? null,
        artStyle: params.settings?.artStyle ?? null,
        subtitles: params.settings?.subtitles ?? true,
        fps: params.settings?.fps ?? platformSettings?.fps ?? 30,
        resolution: params.settings?.resolution ?? platformSettings?.resolution ?? { width: 1080, height: 1920 },
      },
      pipelineId: null,
      script: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    await this.projectRepo.create(project);

    // Record timeline event
    await this.recordEvent(project.id, params.userId, TimelineEventType.PROJECT_CREATED, 'project', 'Project created', { title: project.title });

    log.info('Project created', { projectId: project.id, userId: params.userId, title: project.title });
    return project;
  }

  /** Get a project by ID with ownership check. */
  async getProject(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundError('Project', projectId);
    if (project.userId !== userId) throw new AuthorizationError('You do not own this project');
    return project;
  }

  /** List projects for a user. */
  async listProjects(
    userId: string,
    options: PaginationOptions & { status?: ProjectStatus; contentType?: string },
  ): Promise<PaginatedResult<Project>> {
    return this.projectRepo.findByUser(userId, options);
  }

  /** Update a project. */
  async updateProject(projectId: string, userId: string, updates: Partial<Pick<Project, 'title' | 'description' | 'settings'>>): Promise<void> {
    await this.getProject(projectId, userId); // ownership check
    await this.projectRepo.update(projectId, updates);
    await this.recordEvent(projectId, userId, TimelineEventType.PROJECT_UPDATED, 'project', 'Project updated', { fields: Object.keys(updates) });
  }

  /** Archive a project. */
  async archiveProject(projectId: string, userId: string): Promise<void> {
    await this.getProject(projectId, userId);
    await this.projectRepo.updateStatus(projectId, ProjectStatus.ARCHIVED);
    await this.recordEvent(projectId, userId, TimelineEventType.PROJECT_ARCHIVED, 'project', 'Project archived', {});
  }

  /** Restore an archived project. */
  async restoreProject(projectId: string, userId: string): Promise<void> {
    await this.getProject(projectId, userId);
    await this.projectRepo.updateStatus(projectId, ProjectStatus.DRAFT);
    await this.recordEvent(projectId, userId, TimelineEventType.PROJECT_RESTORED, 'project', 'Project restored', {});
  }

  /** Clone a project (creates a new project with the same settings). */
  async cloneProject(projectId: string, userId: string): Promise<Project> {
    const original = await this.getProject(projectId, userId);
    return this.createProject({
      userId,
      title: `${original.title} (Copy)`,
      description: original.description,
      contentType: original.contentType,
      targetPlatforms: original.targetPlatforms,
      originalPrompt: original.originalPrompt,
      settings: original.settings,
    });
  }

  /** Soft delete a project. */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    await this.getProject(projectId, userId);
    await this.projectRepo.softDelete(projectId);
    log.info('Project deleted', { projectId, userId });
  }

  /** Get project statistics. */
  async getProjectStats(projectId: string, userId: string): Promise<{
    assetCount: number;
    workflowCount: number;
    totalCostUsd: number;
  }> {
    await this.getProject(projectId, userId);
    // In a full implementation, these would query asset/workflow repos
    return { assetCount: 0, workflowCount: 0, totalCostUsd: 0 };
  }

  // ---- Timeline ----

  /** Get project timeline. */
  async getTimeline(
    projectId: string,
    userId: string,
    options: PaginationOptions & { category?: string },
  ): Promise<PaginatedResult<TimelineEvent>> {
    await this.getProject(projectId, userId);
    return this.timelineRepo.findByProject(projectId, options);
  }

  /** Get recent activity for a user. */
  async getRecentActivity(userId: string, limit: number = 50): Promise<TimelineEvent[]> {
    return this.timelineRepo.findByUser(userId, limit);
  }

  // ---- Private ----

  private async recordEvent(
    projectId: string,
    userId: string,
    type: TimelineEventType,
    category: TimelineEvent['category'],
    description: string,
    data: Record<string, unknown>,
    refs?: TimelineEvent['refs'],
  ): Promise<void> {
    const event: TimelineEvent = {
      id: generateId(ID_PREFIXES.step),
      projectId,
      userId,
      type,
      category,
      description,
      data,
      refs: refs ?? {},
      timestamp: new Date(),
    };
    await this.timelineRepo.create(event);
  }
}
