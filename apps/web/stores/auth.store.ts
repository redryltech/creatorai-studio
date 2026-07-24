// ============================================================
// CreatorAI Studio — Auth Store (Zustand)
// ============================================================
// Manages authentication state across the application.
// Listens to Firebase Auth state changes and syncs to Zustand.
// ============================================================

import { create } from 'zustand';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase';
import type { UserPlan } from '@creatorai/shared';

/**
 * Authenticated user state.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: UserPlan;
}

/**
 * Auth store state.
 */
interface AuthState {
  /** Current authenticated user (null if not signed in) */
  user: AuthUser | null;
  /** Whether the initial auth check has completed */
  initialized: boolean;
  /** Whether an auth operation is in progress */
  loading: boolean;
  /** Last auth error message */
  error: string | null;

  // Actions
  initialize: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Convert Firebase user to our AuthUser type.
 */
function toAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    plan: 'free' as UserPlan, // Default plan; real plan loaded from Firestore
  };
}

/**
 * Auth store — Zustand state management for authentication.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  /**
   * Initialize the auth listener.
   * Call this ONCE in the root layout.
   * Returns an unsubscribe function.
   */
  initialize: () => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          set({
            user: toAuthUser(firebaseUser),
            initialized: true,
            loading: false,
          });
        } else {
          set({
            user: null,
            initialized: true,
            loading: false,
          });
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        set({
          error: error.message,
          initialized: true,
          loading: false,
        });
      },
    );
    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Google sign-in failed',
        loading: false,
      });
      throw error;
    }
  },

  signInWithGithub: async () => {
    set({ loading: true, error: null });
    try {
      const auth = getClientAuth();
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'GitHub sign-in failed',
        loading: false,
      });
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign-in failed',
        loading: false,
      });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const auth = getClientAuth();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign-up failed',
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const auth = getClientAuth();
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign-out failed',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
