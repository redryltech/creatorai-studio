import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { AuditLogEntry } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
export declare class AuditLogRepository extends BaseRepository<AuditLogEntry> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): AuditLogEntry;
    protected toFirestore(entity: Partial<AuditLogEntry>): Record<string, unknown>;
    findByWorkspace(workspaceId: string, options: PaginationOptions & {
        category?: string;
        userId?: string;
    }): Promise<PaginatedResult<AuditLogEntry>>;
}
//# sourceMappingURL=audit.repository.d.ts.map