import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { TimelineEvent } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
export declare class TimelineRepository extends BaseRepository<TimelineEvent> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): TimelineEvent;
    protected toFirestore(entity: Partial<TimelineEvent>): Record<string, unknown>;
    /** Get timeline events for a project with pagination and optional filtering. */
    findByProject(projectId: string, options: PaginationOptions & {
        category?: string;
        type?: string;
    }): Promise<PaginatedResult<TimelineEvent>>;
    /** Get recent activity for a user across all projects. */
    findByUser(userId: string, limit?: number): Promise<TimelineEvent[]>;
}
//# sourceMappingURL=timeline.repository.d.ts.map