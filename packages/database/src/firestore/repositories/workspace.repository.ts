// ============================================================
// CreatorAI Studio — Workspace & Member Repositories
// ============================================================

import type { Firestore, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { Workspace, WorkspaceMember, WorkspaceInvitation } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';

export class WorkspaceRepository extends BaseRepository<Workspace> {
  constructor(db: Firestore) { super(db, 'workspaces'); }

  protected fromFirestore(doc: DocumentSnapshot): Workspace {
    const d = doc.data()!;
    return {
      id: doc.id, name: d.name, slug: d.slug, description: d.description ?? '',
      ownerId: d.ownerId,
      settings: d.settings ?? { defaultLanguage: 'en', defaultPlatform: null, defaultArtStyle: null, defaultVoiceId: null, autoApproveAssets: false, maxConcurrentWorkflows: 3, enabledProviders: [] },
      usage: d.usage ?? { projectCount: 0, assetCount: 0, workflowRunCount: 0, storageUsedBytes: 0, totalCostUsd: 0, currentMonthCostUsd: 0 },
      iconUrl: d.iconUrl ?? null,
      createdAt: d.createdAt?.toDate() ?? new Date(),
      updatedAt: d.updatedAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<Workspace>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const snap = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snap.empty) return null;
    return this.fromFirestore(snap.docs[0]!);
  }

  async incrementUsage(workspaceId: string, field: keyof Workspace['usage'], amount: number = 1): Promise<void> {
    await this.collection.doc(workspaceId).update({
      [`usage.${field}`]: FieldValue.increment(amount),
      updatedAt: new Date(),
    });
  }
}

export class WorkspaceMemberRepository extends BaseRepository<WorkspaceMember> {
  constructor(db: Firestore) { super(db, 'workspaceMembers'); }

  protected fromFirestore(doc: DocumentSnapshot): WorkspaceMember {
    const d = doc.data()!;
    return {
      id: doc.id, workspaceId: d.workspaceId, userId: d.userId, email: d.email,
      displayName: d.displayName ?? '', role: d.role, invitedBy: d.invitedBy,
      joinedAt: d.joinedAt?.toDate() ?? new Date(),
      updatedAt: d.updatedAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<WorkspaceMember>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.findByField('workspaceId', workspaceId, 'joinedAt', 'asc');
  }

  async findByUser(userId: string): Promise<WorkspaceMember[]> {
    return this.findByField('userId', userId, 'joinedAt', 'desc');
  }

  async findMembership(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    const snap = await this.collection
      .where('workspaceId', '==', workspaceId)
      .where('userId', '==', userId)
      .limit(1).get();
    if (snap.empty) return null;
    return this.fromFirestore(snap.docs[0]!);
  }
}

export class WorkspaceInvitationRepository extends BaseRepository<WorkspaceInvitation> {
  constructor(db: Firestore) { super(db, 'workspaceInvitations'); }

  protected fromFirestore(doc: DocumentSnapshot): WorkspaceInvitation {
    const d = doc.data()!;
    return {
      id: doc.id, workspaceId: d.workspaceId, workspaceName: d.workspaceName,
      email: d.email, role: d.role, invitedBy: d.invitedBy, status: d.status,
      expiresAt: d.expiresAt?.toDate() ?? new Date(),
      createdAt: d.createdAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<WorkspaceInvitation>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findPendingByEmail(email: string): Promise<WorkspaceInvitation[]> {
    const snap = await this.collection
      .where('email', '==', email).where('status', '==', 'pending')
      .orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => this.fromFirestore(d));
  }
}
