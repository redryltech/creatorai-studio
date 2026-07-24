// ============================================================
// CreatorAI Studio — Timeline Repository
// ============================================================
import { BaseRepository } from './base.repository';
export class TimelineRepository extends BaseRepository {
    constructor(db) {
        super(db, 'timelineEvents');
    }
    fromFirestore(doc) {
        const d = doc.data();
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
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    /** Get timeline events for a project with pagination and optional filtering. */
    async findByProject(projectId, options) {
        return this.findPaginated((ref) => {
            let q = ref.where('projectId', '==', projectId);
            if (options.category)
                q = q.where('category', '==', options.category);
            if (options.type)
                q = q.where('type', '==', options.type);
            return q;
        }, { ...options, orderBy: 'timestamp', orderDirection: 'desc' });
    }
    /** Get recent activity for a user across all projects. */
    async findByUser(userId, limit = 50) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => this.fromFirestore(doc));
    }
}
//# sourceMappingURL=timeline.repository.js.map