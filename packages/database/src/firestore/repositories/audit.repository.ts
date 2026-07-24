// ============================================================
// CreatorAI Studio — Audit Log Repository
// ============================================================

import type { Firestore, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import type { AuditLogEntry } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';

export class AuditLogRepository extends BaseRepository<AuditLogEntry> {
  constructor(db: Firestore) { super(db, 'auditLogs'); }

  protected fromFirestore(doc: DocumentSnapshot): AuditLogEntry {
    const d = doc.data()!;
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

  protected toFirestore(entity: Partial<AuditLogEntry>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findByWorkspace(
    workspaceId: string,
    options: PaginationOptions & { category?: string; userId?: string },
  ): Promise<PaginatedResult<AuditLogEntry>> {
    return this.findPaginated(
      (ref) => {
        let q: Query = ref.where('workspaceId', '==', workspaceId);
        if (options.category) q = q.where('category', '==', options.category);
        if (options.userId) q = q.where('userId', '==', options.userId);
        return q;
      },
      { ...options, orderBy: 'timestamp', orderDirection: 'desc' },
    );
  }
}
