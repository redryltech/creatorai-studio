// ============================================================
// CreatorAI Studio — Audit Log Repository
// ============================================================
import { BaseRepository } from './base.repository';
export class AuditLogRepository extends BaseRepository {
    constructor(db) { super(db, 'auditLogs'); }
    fromFirestore(doc) {
        const d = doc.data();
        return {
            id: doc.id,
            workspaceId: d.workspaceId, userId: d.userId, userEmail: d.userEmail,
            action: d.action, category: d.category,
            resource: d.resource ?? { type: 'unknown', id: '', name: null },
            changes: d.changes ?? null,
            context: d.context ?? { ipAddress: null, userAgent: null, requestId: null },
            timestamp: d.timestamp?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    async findByWorkspace(workspaceId, options) {
        return this.findPaginated((ref) => {
            let q = ref.where('workspaceId', '==', workspaceId);
            if (options.category)
                q = q.where('category', '==', options.category);
            if (options.userId)
                q = q.where('userId', '==', options.userId);
            return q;
        }, { ...options, orderBy: 'timestamp', orderDirection: 'desc' });
    }
}
//# sourceMappingURL=audit.repository.js.map