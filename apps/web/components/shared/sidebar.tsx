'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { cn, getInitials } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Automation Studio', href: '/automation', icon: '🚀', section: 'create' },
  { label: 'AI Chat', href: '/chat', icon: '💬', section: 'create' },
  { label: 'Projects', href: '/projects', icon: '📁', section: 'create' },
  { label: 'Media Library', href: '/media', icon: '🖼️', section: 'create' },
  { label: 'Music Library', href: '/music', icon: '🎵', section: 'create' },
  { label: 'Workflows', href: '/editor', icon: '⚡', section: 'create' },
  { label: 'Calendar', href: '/calendar', icon: '📅', section: 'create' },
  { label: 'Brand Profiles', href: '/brand', icon: '🎨', section: 'workspace' },
  { label: 'AI Memory', href: '/workspace', icon: '🧠', section: 'workspace' },
  { label: 'Analytics', href: '/analytics', icon: '📊', section: 'monitor' },
  { label: 'Monitoring', href: '/monitoring', icon: '🔍', section: 'monitor' },
  { label: 'Settings', href: '/settings', icon: '⚙️', section: 'system' },
];

const sectionLabels: Record<string, string> = {
  create: 'CREATE',
  workspace: 'WORKSPACE',
  monitor: 'MONITOR',
  system: 'SYSTEM',
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [collapsed, setCollapsed] = useState(false);

  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section ?? 'other';
    (acc[section] ??= []).push(item);
    return acc;
  }, {});

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen border-r border-surface-800 bg-surface-950 flex flex-col transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    )}>
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-surface-800 gap-2.5 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg animated-gradient flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-surface-100 truncate">CreatorAI</h1>
            <p className="text-2xs text-surface-500">Studio</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('ml-auto text-surface-500 hover:text-surface-300 transition-colors p-1', collapsed && 'mx-auto')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-4 px-2">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-2xs font-semibold text-surface-600 uppercase tracking-wider">
                {sectionLabels[section] ?? section}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-brand-600/12 text-brand-400'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/60',
                      collapsed && 'justify-center px-0',
                    )}>
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-2xs px-1.5 py-0.5 rounded-full bg-brand-600/20 text-brand-400">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-800 flex-shrink-0">
        <div className={cn('flex items-center gap-2.5', collapsed ? 'justify-center' : 'px-1')}>
          <div className="h-8 w-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-400 flex-shrink-0">
            {getInitials(user?.displayName ?? user?.email ?? 'U')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-200 truncate">{user?.displayName ?? 'User'}</p>
              <button onClick={signOut} className="text-2xs text-surface-500 hover:text-red-400 transition-colors">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
