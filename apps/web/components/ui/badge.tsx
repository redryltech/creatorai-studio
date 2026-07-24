'use client';
import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-700/50 text-surface-200 border-surface-600',
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  outline: 'bg-transparent text-surface-300 border-surface-600',
};

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
