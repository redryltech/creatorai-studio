'use client';
import { cn } from '@/lib/utils';

export function ProgressBar({ value, max = 100, size = 'sm', color = 'brand', label, className }: { value: number; max?: number; size?: 'xs' | 'sm' | 'md'; color?: 'brand' | 'green' | 'yellow' | 'red'; label?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' };
  const colors = { brand: 'bg-brand-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-2xs text-surface-400">{label}</span>
          <span className="text-2xs text-surface-400">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-800 overflow-hidden', heights[size])}>
        <div className={cn('rounded-full transition-all duration-500 ease-out', heights[size], colors[color])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
