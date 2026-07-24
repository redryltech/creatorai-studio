'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-center justify-between h-14 px-6 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm flex-shrink-0', className)}>
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-surface-100 truncate">{title}</h1>
        {badge}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
