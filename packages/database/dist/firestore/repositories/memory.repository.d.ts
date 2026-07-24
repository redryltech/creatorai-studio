import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { AIMemory, BrandProfile } from '@creatorai/shared';
import { BaseRepository } from './base.repository';
export declare class AIMemoryRepository extends BaseRepository<AIMemory> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): AIMemory;
    protected toFirestore(entity: Partial<AIMemory>): Record<string, unknown>;
    /** Get workspace-level memory. */
    getWorkspaceMemory(workspaceId: string): Promise<AIMemory | null>;
    /** Get project-level memory. */
    getProjectMemory(workspaceId: string, projectId: string): Promise<AIMemory | null>;
}
export declare class BrandProfileRepository extends BaseRepository<BrandProfile> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): BrandProfile;
    protected toFirestore(entity: Partial<BrandProfile>): Record<string, unknown>;
    findByWorkspace(workspaceId: string): Promise<BrandProfile[]>;
    getDefaultBrand(workspaceId: string): Promise<BrandProfile | null>;
}
//# sourceMappingURL=memory.repository.d.ts.map