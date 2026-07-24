// ============================================================
// CreatorAI Studio — Workspace Service
// ============================================================
// Manages workspace lifecycle, membership, invitations, and
// RBAC permission checking.
// ============================================================

import type { Workspace, WorkspaceMember, WorkspaceInvitation, AuditLogEntry } from '@creatorai/shared';
import { WorkspaceRole, Permission, ROLE_PERMISSIONS, generateId, ID_PREFIXES, NotFoundError, AuthorizationError } from '@creatorai/shared';
import type { WorkspaceRepository, WorkspaceMemberRepository, WorkspaceInvitationRepository, AuditLogRepository } from '@creatorai/database';
import { Logger } from '@creatorai/agents';
import { slugify } from '@creatorai/shared';

const log = Logger.for('WorkspaceService');

export class WorkspaceService {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly memberRepo: WorkspaceMemberRepository,
    private readonly invitationRepo: WorkspaceInvitationRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {}

  // ---- Workspace CRUD ----

  async createWorkspace(params: {
    userId: string;
    userEmail: string;
    name: string;
    description?: string;
  }): Promise<{ workspace: Workspace; member: WorkspaceMember }> {
    const workspaceId = generateId(ID_PREFIXES.project);
    let slug = slugify(params.name);

    // Ensure unique slug
    const existing = await this.workspaceRepo.findBySlug(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const workspace: Workspace = {
      id: workspaceId,
      name: params.name,
      slug,
      description: params.description ?? '',
      ownerId: params.userId,
      settings: {
        defaultLanguage: 'en',
        defaultPlatform: null,
        defaultArtStyle: null,
        defaultVoiceId: null,
        autoApproveAssets: false,
        maxConcurrentWorkflows: 3,
        enabledProviders: ['openai', 'replicate', 'elevenlabs'],
      },
      usage: { projectCount: 0, assetCount: 0, workflowRunCount: 0, storageUsedBytes: 0, totalCostUsd: 0, currentMonthCostUsd: 0 },
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.workspaceRepo.create(workspace);

    // Add creator as owner
    const member = await this.addMember(workspaceId, params.userId, params.userEmail, WorkspaceRole.OWNER, params.userId);

    await this.audit(workspaceId, params.userId, params.userEmail, 'workspace.create', 'workspace', { type: 'workspace', id: workspaceId, name: params.name });

    log.info('Workspace created', { workspaceId, name: params.name, userId: params.userId });

    return { workspace, member };
  }

  async getWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
    await this.requirePermission(workspaceId, userId, Permission.PROJECT_VIEW);
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) throw new NotFoundError('Workspace', workspaceId);
    return workspace;
  }

  async getUserWorkspaces(userId: string): Promise<Array<{ workspace: Workspace; role: WorkspaceRole }>> {
    const memberships = await this.memberRepo.findByUser(userId);
    const results: Array<{ workspace: Workspace; role: WorkspaceRole }> = [];

    for (const m of memberships) {
      const workspace = await this.workspaceRepo.findById(m.workspaceId);
      if (workspace) results.push({ workspace, role: m.role });
    }

    return results;
  }

  async updateWorkspace(workspaceId: string, userId: string, userEmail: string, updates: Partial<Pick<Workspace, 'name' | 'description' | 'settings'>>): Promise<void> {
    await this.requirePermission(workspaceId, userId, Permission.WORKSPACE_SETTINGS);
    await this.workspaceRepo.update(workspaceId, updates);
    await this.audit(workspaceId, userId, userEmail, 'workspace.update', 'settings', { type: 'workspace', id: workspaceId, name: null }, { fields: Object.keys(updates) });
  }

  // ---- Members ----

  async getMembers(workspaceId: string, userId: string): Promise<WorkspaceMember[]> {
    await this.requirePermission(workspaceId, userId, Permission.PROJECT_VIEW);
    return this.memberRepo.findByWorkspace(workspaceId);
  }

  async inviteMember(workspaceId: string, userId: string, userEmail: string, params: { email: string; role: WorkspaceRole }): Promise<WorkspaceInvitation> {
    await this.requirePermission(workspaceId, userId, Permission.WORKSPACE_MEMBERS);
    const workspace = await this.workspaceRepo.findByIdOrThrow(workspaceId);

    const invitation: WorkspaceInvitation = {
      id: generateId(ID_PREFIXES.step),
      workspaceId,
      workspaceName: workspace.name,
      email: params.email,
      role: params.role,
      invitedBy: userId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000), // 7 days
      createdAt: new Date(),
    };

    await this.invitationRepo.create(invitation);
    await this.audit(workspaceId, userId, userEmail, 'workspace.member.invite', 'workspace', { type: 'invitation', id: invitation.id, name: params.email });

    log.info('Member invited', { workspaceId, email: params.email, role: params.role });
    return invitation;
  }

  async acceptInvitation(invitationId: string, userId: string, userEmail: string): Promise<WorkspaceMember> {
    const invitation = await this.invitationRepo.findByIdOrThrow(invitationId);
    if (invitation.status !== 'pending') throw new Error('Invitation is no longer pending');
    if (invitation.email !== userEmail) throw new AuthorizationError('This invitation is for a different email');
    if (new Date() > invitation.expiresAt) {
      await this.invitationRepo.update(invitationId, { status: 'expired' } as Partial<WorkspaceInvitation>);
      throw new Error('Invitation has expired');
    }

    await this.invitationRepo.update(invitationId, { status: 'accepted' } as Partial<WorkspaceInvitation>);
    const member = await this.addMember(invitation.workspaceId, userId, userEmail, invitation.role, invitation.invitedBy);

    await this.audit(invitation.workspaceId, userId, userEmail, 'workspace.member.join', 'workspace', { type: 'member', id: member.id, name: userEmail });

    return member;
  }

  async updateMemberRole(workspaceId: string, memberId: string, userId: string, userEmail: string, newRole: WorkspaceRole): Promise<void> {
    await this.requirePermission(workspaceId, userId, Permission.WORKSPACE_MEMBERS);
    await this.memberRepo.update(memberId, { role: newRole, updatedAt: new Date() } as Partial<WorkspaceMember>);
    await this.audit(workspaceId, userId, userEmail, 'workspace.member.role_change', 'workspace', { type: 'member', id: memberId, name: null }, { newRole });
  }

  async removeMember(workspaceId: string, memberId: string, userId: string, userEmail: string): Promise<void> {
    await this.requirePermission(workspaceId, userId, Permission.WORKSPACE_MEMBERS);
    const member = await this.memberRepo.findByIdOrThrow(memberId);
    if (member.role === WorkspaceRole.OWNER) throw new Error('Cannot remove workspace owner');
    await this.memberRepo.delete(memberId);
    await this.audit(workspaceId, userId, userEmail, 'workspace.member.remove', 'workspace', { type: 'member', id: memberId, name: member.email });
  }

  // ---- RBAC ----

  /**
   * Check if a user has a specific permission in a workspace.
   * Throws AuthorizationError if not.
   */
  async requirePermission(workspaceId: string, userId: string, permission: Permission): Promise<WorkspaceMember> {
    const member = await this.memberRepo.findMembership(workspaceId, userId);
    if (!member) throw new AuthorizationError('You are not a member of this workspace');

    const allowed = ROLE_PERMISSIONS[member.role];
    if (!allowed.includes(permission)) {
      throw new AuthorizationError(`Permission denied: ${permission} requires role ${this.minimumRoleFor(permission)}`);
    }

    return member;
  }

  /**
   * Check permission without throwing (returns boolean).
   */
  async hasPermission(workspaceId: string, userId: string, permission: Permission): Promise<boolean> {
    try {
      await this.requirePermission(workspaceId, userId, permission);
      return true;
    } catch {
      return false;
    }
  }

  // ---- Private ----

  private async addMember(workspaceId: string, userId: string, email: string, role: WorkspaceRole, invitedBy: string): Promise<WorkspaceMember> {
    const member: WorkspaceMember = {
      id: generateId(ID_PREFIXES.step),
      workspaceId, userId, email, displayName: email.split('@')[0] ?? email,
      role, invitedBy, joinedAt: new Date(), updatedAt: new Date(),
    };
    await this.memberRepo.create(member);
    return member;
  }

  private minimumRoleFor(permission: Permission): string {
    for (const role of [WorkspaceRole.VIEWER, WorkspaceRole.REVIEWER, WorkspaceRole.EDITOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER]) {
      if (ROLE_PERMISSIONS[role].includes(permission)) return role;
    }
    return 'owner';
  }

  private async audit(
    workspaceId: string, userId: string, userEmail: string,
    action: string, category: AuditLogEntry['category'],
    resource: AuditLogEntry['resource'],
    changes?: Record<string, unknown>,
  ): Promise<void> {
    await this.auditRepo.create({
      id: generateId(ID_PREFIXES.step),
      workspaceId, userId, userEmail,
      action, category, resource,
      changes: changes ? Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, { before: null, after: v }])) : null,
      context: { ipAddress: null, userAgent: null, requestId: null },
      timestamp: new Date(),
    });
  }
}
