// ============================================================
// CreatorAI Studio — Landing / Redirect Page
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (initialized) {
      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/login');
      }
    }
  }, [user, initialized, router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl animated-gradient animate-pulse" />
        <h1 className="text-xl font-semibold gradient-text">CreatorAI Studio</h1>
        <p className="text-sm text-surface-400">Redirecting...</p>
      </div>
    </div>
  );
}
