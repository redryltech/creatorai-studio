'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/project.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { cn, formatRelativeTime } from '@/lib/utils';

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default', processing: 'warning', completed: 'success', failed: 'danger', published: 'info', archived: 'default',
};

export default function ProjectsPage() {
  const { projects, loading, loadProjects } = useProjectStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = search
    ? (projects as any[]).filter((p: any) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    : (projects as any[]);

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Projects"
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-surface-800 rounded-lg p-0.5">
              <button onClick={() => setView('grid')} className={cn('px-2 py-1 rounded-md text-xs transition-colors', view === 'grid' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200')}>
                ▦
              </button>
              <button onClick={() => setView('list')} className={cn('px-2 py-1 rounded-md text-xs transition-colors', view === 'list' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200')}>
                ☰
              </button>
            </div>
            <Button size="sm" onClick={() => window.location.href = '/chat'}>+ New Project</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <div className="mb-5 max-w-md">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
          />
        </div>

        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📁"
            title={search ? 'No matches found' : 'No projects yet'}
            description={search ? 'Try a different search term.' : 'Start by chatting with the AI to create your first project.'}
            actionLabel={search ? undefined : 'Go to AI Chat'}
            onAction={search ? undefined : () => window.location.href = '/chat'}
          />
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filtered.map((project: any) => (
              view === 'grid' ? (
                <Card key={project.id} hover onClick={() => window.location.href = `/projects/${project.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-surface-100 truncate pr-2">{project.title}</h3>
                    <Badge variant={statusBadgeVariant[project.status] ?? 'default'}>{project.status}</Badge>
                  </div>
                  <p className="text-xs text-surface-400 line-clamp-2 mb-3">{project.description || project.originalPrompt || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {project.contentType && <Badge>{project.contentType.replace(/_/g, ' ')}</Badge>}
                      {project.targetPlatforms?.[0] && <Badge variant="outline">{project.targetPlatforms[0].replace(/_/g, ' ')}</Badge>}
                    </div>
                    <span className="text-2xs text-surface-500">{formatRelativeTime(project.createdAt)}</span>
                  </div>
                </Card>
              ) : (
                <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg border border-surface-800/50 hover:bg-surface-800/30 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/projects/${project.id}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-surface-100 truncate">{project.title}</h3>
                    <p className="text-xs text-surface-400 truncate">{project.description || project.originalPrompt || 'No description'}</p>
                  </div>
                  <Badge variant={statusBadgeVariant[project.status] ?? 'default'}>{project.status}</Badge>
                  <span className="text-2xs text-surface-500 flex-shrink-0">{formatRelativeTime(project.createdAt)}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
