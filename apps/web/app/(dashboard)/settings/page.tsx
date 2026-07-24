'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center h-14 px-6 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm">
        <h1 className="text-sm font-semibold text-surface-100">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-surface-200 mb-4">Account</h2>
          <div className="p-5 rounded-xl border border-surface-800 bg-surface-900/30 space-y-4">
            <div>
              <label className="text-xs text-surface-400">Email</label>
              <p className="text-sm text-surface-100">{user?.email ?? 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs text-surface-400">Display Name</label>
              <p className="text-sm text-surface-100">{user?.displayName ?? 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs text-surface-400">Plan</label>
              <p className="text-sm text-surface-100 capitalize">{user?.plan ?? 'free'}</p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
            <p className="text-sm text-surface-300">
              Sign out of your account on this device.
            </p>
            <Button variant="danger" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
