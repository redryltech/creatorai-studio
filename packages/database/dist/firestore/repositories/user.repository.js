// ============================================================
// CreatorAI Studio — User Repository
// ============================================================
import { FieldValue } from 'firebase-admin/firestore';
import { UserPlan } from '@creatorai/shared';
import { COLLECTIONS } from '../collections';
import { BaseRepository } from './base.repository';
export class UserRepository extends BaseRepository {
    constructor(db) {
        super(db, COLLECTIONS.USERS);
    }
    fromFirestore(doc) {
        const data = doc.data();
        return {
            id: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL ?? null,
            plan: data.plan ?? UserPlan.FREE,
            usage: {
                videosGenerated: data.usage?.videosGenerated ?? 0,
                imagesGenerated: data.usage?.imagesGenerated ?? 0,
                voiceoversGenerated: data.usage?.voiceoversGenerated ?? 0,
                storageUsedBytes: data.usage?.storageUsedBytes ?? 0,
                apiCallsThisMonth: data.usage?.apiCallsThisMonth ?? 0,
                lastResetAt: data.usage?.lastResetAt?.toDate() ?? new Date(),
            },
            preferences: {
                defaultPlatform: data.preferences?.defaultPlatform ?? 'youtube',
                defaultLanguage: data.preferences?.defaultLanguage ?? 'en',
                defaultVoice: data.preferences?.defaultVoice ?? null,
                defaultArtStyle: data.preferences?.defaultArtStyle ?? null,
                brandVoice: data.preferences?.brandVoice ?? null,
                subtitlesEnabled: data.preferences?.subtitlesEnabled ?? true,
            },
            connectedAccounts: data.connectedAccounts ?? {
                youtube: null,
                instagram: null,
                tiktok: null,
                facebook: null,
                linkedin: null,
                x: null,
            },
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    /**
     * Create a new user from Firebase Auth data.
     * Called after first sign-in.
     */
    async createFromAuth(authUser) {
        const now = new Date();
        const user = {
            id: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName ?? authUser.email.split('@')[0] ?? 'User',
            photoURL: authUser.photoURL,
            plan: UserPlan.FREE,
            usage: {
                videosGenerated: 0,
                imagesGenerated: 0,
                voiceoversGenerated: 0,
                storageUsedBytes: 0,
                apiCallsThisMonth: 0,
                lastResetAt: now,
            },
            preferences: {
                defaultPlatform: 'youtube',
                defaultLanguage: 'en',
                defaultVoice: null,
                defaultArtStyle: null,
                brandVoice: null,
                subtitlesEnabled: true,
            },
            connectedAccounts: {
                youtube: null,
                instagram: null,
                tiktok: null,
                facebook: null,
                linkedin: null,
                x: null,
            },
            createdAt: now,
            updatedAt: now,
        };
        return this.create(user);
    }
    /**
     * Get or create a user (upsert on first sign-in).
     */
    async getOrCreate(authUser) {
        const existing = await this.findById(authUser.uid);
        if (existing)
            return existing;
        return this.createFromAuth(authUser);
    }
    /**
     * Update user preferences.
     */
    async updatePreferences(userId, preferences) {
        const updates = {};
        for (const [key, value] of Object.entries(preferences)) {
            updates[`preferences.${key}`] = value;
        }
        updates.updatedAt = new Date();
        await this.collection.doc(userId).update(updates);
    }
    /**
     * Increment a usage counter.
     */
    async incrementUsage(userId, field, amount = 1) {
        await this.collection.doc(userId).update({
            [`usage.${field}`]: FieldValue.increment(amount),
            updatedAt: new Date(),
        });
    }
    /**
     * Reset monthly API call counter.
     * Called by a scheduled function on billing cycle reset.
     */
    async resetMonthlyUsage(userId) {
        await this.collection.doc(userId).update({
            'usage.apiCallsThisMonth': 0,
            'usage.lastResetAt': new Date(),
            updatedAt: new Date(),
        });
    }
    /**
     * Update user's plan.
     */
    async updatePlan(userId, plan) {
        await this.collection.doc(userId).update({
            plan,
            updatedAt: new Date(),
        });
    }
    /**
     * Find user by email.
     */
    async findByEmail(email) {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty)
            return null;
        return this.fromFirestore(snapshot.docs[0]);
    }
}
//# sourceMappingURL=user.repository.js.map