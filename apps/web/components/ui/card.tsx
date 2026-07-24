'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, hover, onClick }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-800 bg-surface-900/40 p-5',
        hover && 'cursor-pointer transition-all duration-200 hover:border-surface-700 hover:bg-surface-800/40 hover:shadow-lg hover:shadow-black/10',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold text-surface-100', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-sm text-surface-300', className)}>{children}</div>;
}
