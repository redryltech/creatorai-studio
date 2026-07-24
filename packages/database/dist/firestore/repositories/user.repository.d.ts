import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { User, UserPreferences } from '@creatorai/shared';
import { UserPlan } from '@creatorai/shared';
import { BaseRepository } from './base.repository';
export declare class UserRepository extends BaseRepository<User> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): User;
    protected toFirestore(entity: Partial<User>): Record<string, unknown>;
    /**
     * Create a new user from Firebase Auth data.
     * Called after first sign-in.
     */
    createFromAuth(authUser: {
        uid: string;
        email: string;
        displayName: string | null;
        photoURL: string | null;
    }): Promise<User>;
    /**
     * Get or create a user (upsert on first sign-in).
     */
    getOrCreate(authUser: {
        uid: string;
        email: string;
        displayName: string | null;
        photoURL: string | null;
    }): Promise<User>;
    /**
     * Update user preferences.
     */
    updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
    /**
     * Increment a usage counter.
     */
    incrementUsage(userId: string, field: keyof User['usage'], amount?: number): Promise<void>;
    /**
     * Reset monthly API call counter.
     * Called by a scheduled function on billing cycle reset.
     */
    resetMonthlyUsage(userId: string): Promise<void>;
    /**
     * Update user's plan.
     */
    updatePlan(userId: string, plan: UserPlan): Promise<void>;
    /**
     * Find user by email.
     */
    findByEmail(email: string): Promise<User | null>;
}
//# sourceMappingURL=user.repository.d.ts.map