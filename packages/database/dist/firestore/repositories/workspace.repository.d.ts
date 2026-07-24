import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { Workspace, WorkspaceMember, WorkspaceInvitation } from '@creatorai/shared';
import { BaseRepository } from './base.repository';
export declare class WorkspaceRepository extends BaseRepository<Workspace> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): Workspace;
    protected toFirestore(entity: Partial<Workspace>): Record<string, unknown>;
    findBySlug(slug: string): Promise<Workspace | null>;
    incrementUsage(workspaceId: string, field: keyof Workspace['usage'], amount?: number): Promise<void>;
}
export declare class WorkspaceMemberRepository extends BaseRepository<WorkspaceMember> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): WorkspaceMember;
    protected toFirestore(entity: Partial<WorkspaceMember>): Record<string, unknown>;
    findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]>;
    findByUser(userId: string): Promise<WorkspaceMember[]>;
    findMembership(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
}
export declare class WorkspaceInvitationRepository extends BaseRepository<WorkspaceInvitation> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): WorkspaceInvitation;
    protected toFirestore(entity: Partial<WorkspaceInvitation>): Record<string, unknown>;
    findPendingByEmail(email: string): Promise<WorkspaceInvitation[]>;
}
//# sourceMappingURL=workspace.repository.d.ts.map