'use client';
import React from 'react';
import { Button } from './button';

export function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: string; title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="h-16 w-16 rounded-2xl bg-surface-800/60 flex items-center justify-center mb-5">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-surface-100 mb-1.5">{title}</h3>
      <p className="text-sm text-surface-400 text-center max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
