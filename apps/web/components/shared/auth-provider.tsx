// ============================================================
// CreatorAI Studio — Auth Provider
// ============================================================
// Wraps the app to initialize Firebase auth listener.
// Shows a loading screen until auth state is determined.
// ============================================================

'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg animated-gradient animate-pulse" />
          <p className="text-sm text-surface-400">Loading CreatorAI Studio...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
