// ============================================================
// CreatorAI Studio — Timeline Repository
// ============================================================

import type { Firestore, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import type { TimelineEvent } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';

export class TimelineRepository extends BaseRepository<TimelineEvent> {
  constructor(db: Firestore) {
    super(db, 'timelineEvents');
  }

  protected fromFirestore(doc: DocumentSnapshot): TimelineEvent {
    const d = doc.data()!;
    return {
      id: doc.id,
      projectId: d.projectId,
      userId: d.userId,
      type: d.type,
      category: d.category,
      description: d.description,
      data: d.data ?? {},
      refs: d.refs ?? {},
      timestamp: d.timestamp?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<TimelineEvent>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /** Get timeline events for a project with pagination and optional filtering. */
  async findByProject(
    projectId: string,
    options: PaginationOptions & { category?: string; type?: string },
  ): Promise<PaginatedResult<TimelineEvent>> {
    return this.findPaginated(
      (ref) => {
        let q: Query = ref.where('projectId', '==', projectId);
        if (options.category) q = q.where('category', '==', options.category);
        if (options.type) q = q.where('type', '==', options.type);
        return q;
      },
      { ...options, orderBy: 'timestamp', orderDirection: 'desc' },
    );
  }

  /** Get recent activity for a user across all projects. */
  async findByUser(
    userId: string,
    limit: number = 50,
  ): Promise<TimelineEvent[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }
}
