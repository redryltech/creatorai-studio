// ============================================================
// CreatorAI Studio — User Repository
// ============================================================

import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { User, UserPreferences } from '@creatorai/shared';
import { UserPlan } from '@creatorai/shared';
import { COLLECTIONS } from '../collections';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor(db: Firestore) {
    super(db, COLLECTIONS.USERS);
  }

  protected fromFirestore(doc: DocumentSnapshot): User {
    const data = doc.data()!;
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

  protected toFirestore(entity: Partial<User>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /**
   * Create a new user from Firebase Auth data.
   * Called after first sign-in.
   */
  async createFromAuth(authUser: {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  }): Promise<User> {
    const now = new Date();
    const user: User = {
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
  async getOrCreate(authUser: {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  }): Promise<User> {
    const existing = await this.findById(authUser.uid);
    if (existing) return existing;
    return this.createFromAuth(authUser);
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(preferences)) {
      updates[`preferences.${key}`] = value;
    }
    updates.updatedAt = new Date();
    await this.collection.doc(userId).update(updates);
  }

  /**
   * Increment a usage counter.
   */
  async incrementUsage(
    userId: string,
    field: keyof User['usage'],
    amount: number = 1,
  ): Promise<void> {
    await this.collection.doc(userId).update({
      [`usage.${field}`]: FieldValue.increment(amount),
      updatedAt: new Date(),
    });
  }

  /**
   * Reset monthly API call counter.
   * Called by a scheduled function on billing cycle reset.
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    await this.collection.doc(userId).update({
      'usage.apiCallsThisMonth': 0,
      'usage.lastResetAt': new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update user's plan.
   */
  async updatePlan(userId: string, plan: UserPlan): Promise<void> {
    await this.collection.doc(userId).update({
      plan,
      updatedAt: new Date(),
    });
  }

  /**
   * Find user by email.
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return this.fromFirestore(snapshot.docs[0]!);
  }
}
