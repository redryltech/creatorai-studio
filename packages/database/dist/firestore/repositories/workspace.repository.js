// ============================================================
// CreatorAI Studio — Workspace & Member Repositories
// ============================================================
import { FieldValue } from 'firebase-admin/firestore';
import { BaseRepository } from './base.repository';
export class WorkspaceRepository extends BaseRepository {
    constructor(db) { super(db, 'workspaces'); }
    fromFirestore(doc) {
        const d = doc.data();
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
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    async findBySlug(slug) {
        const snap = await this.collection.where('slug', '==', slug).limit(1).get();
        if (snap.empty)
            return null;
        return this.fromFirestore(snap.docs[0]);
    }
    async incrementUsage(workspaceId, field, amount = 1) {
        await this.collection.doc(workspaceId).update({
            [`usage.${field}`]: FieldValue.increment(amount),
            updatedAt: new Date(),
        });
    }
}
export class WorkspaceMemberRepository extends BaseRepository {
    constructor(db) { super(db, 'workspaceMembers'); }
    fromFirestore(doc) {
        const d = doc.data();
        return {
            id: doc.id, workspaceId: d.workspaceId, userId: d.userId, email: d.email,
            displayName: d.displayName ?? '', role: d.role, invitedBy: d.invitedBy,
            joinedAt: d.joinedAt?.toDate() ?? new Date(),
            updatedAt: d.updatedAt?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    async findByWorkspace(workspaceId) {
        return this.findByField('workspaceId', workspaceId, 'joinedAt', 'asc');
    }
    async findByUser(userId) {
        return this.findByField('userId', userId, 'joinedAt', 'desc');
    }
    async findMembership(workspaceId, userId) {
        const snap = await this.collection
            .where('workspaceId', '==', workspaceId)
            .where('userId', '==', userId)
            .limit(1).get();
        if (snap.empty)
            return null;
        return this.fromFirestore(snap.docs[0]);
    }
}
export class WorkspaceInvitationRepository extends BaseRepository {
    constructor(db) { super(db, 'workspaceInvitations'); }
    fromFirestore(doc) {
        const d = doc.data();
        return {
            id: doc.id, workspaceId: d.workspaceId, workspaceName: d.workspaceName,
            email: d.email, role: d.role, invitedBy: d.invitedBy, status: d.status,
            expiresAt: d.expiresAt?.toDate() ?? new Date(),
            createdAt: d.createdAt?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    async findPendingByEmail(email) {
        const snap = await this.collection
            .where('email', '==', email).where('status', '==', 'pending')
            .orderBy('createdAt', 'desc').get();
        return snap.docs.map((d) => this.fromFirestore(d));
    }
}
//# sourceMappingURL=workspace.repository.js.map