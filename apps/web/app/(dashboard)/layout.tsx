'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/shared/sidebar';
import { ToastProvider } from '@/components/ui/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  // In development mode, skip auth redirect — allow access without login
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev && initialized && !user) router.replace('/login');
  }, [user, initialized, router, isDev]);

  // In production, show loading while auth initializes
  if (!isDev && (!initialized || !user)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-950">
        <div className="h-8 w-8 rounded-lg animated-gradient animate-pulse" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-950">
        <Sidebar />
        <main className="flex-1 ml-60 transition-all duration-200">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
