'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab { id: string; label: string; icon?: string; count?: number; }

export function Tabs({ tabs, defaultTab, onChange, children }: { tabs: Tab[]; defaultTab?: string; onChange?: (id: string) => void; children: (activeTab: string) => React.ReactNode }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleChange = (id: string) => { setActive(id); onChange?.(id); };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-surface-800 mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => handleChange(tab.id)} className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            active === tab.id ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200 hover:border-surface-600',
          )}>
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('text-2xs px-1.5 py-0.5 rounded-full', active === tab.id ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700 text-surface-400')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
