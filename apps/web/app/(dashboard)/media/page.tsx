'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

const assetTabs = [
  { id: 'all', label: 'All', icon: '📂' },
  { id: 'image', label: 'Images', icon: '🖼️' },
  { id: 'video', label: 'Videos', icon: '🎬' },
  { id: 'audio', label: 'Audio', icon: '🎙️' },
  { id: 'script', label: 'Scripts', icon: '📝' },
  { id: 'thumbnail', label: 'Thumbnails', icon: '🎯' },
];

const typeIcons: Record<string, string> = {
  image: '🖼️', video: '🎬', audio: '🎙️', voiceover: '🎙️', script: '📝',
  scene_breakdown: '📋', image_prompt: '🎨', thumbnail: '🎯', seo_metadata: '🔍',
  composed_video: '🎞️', document: '📄', default: '📦',
};

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  // In production, this would use useQuery to call api.assets.listMediaLibrary()
  // For now, show the structure that will be populated when backend is connected
  const assets: any[] = [];

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Media Library"
        description=""
        actions={<Button size="sm" variant="secondary">Upload</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Search + Filters */}
        <div className="flex items-center gap-4 mb-5">
          <div className="max-w-sm flex-1">
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={assetTabs} defaultTab="all" onChange={setActiveType}>
          {(tab) => (
            <div>
              {assets.length === 0 ? (
                <EmptyState
                  icon="🖼️"
                  title="No assets yet"
                  description="Generated content will appear here automatically. Start by creating a project in AI Chat."
                  actionLabel="Create Content"
                  onAction={() => window.location.href = '/chat'}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {assets.map((asset: any) => (
                    <div key={asset.id} className="group relative rounded-xl border border-surface-800 bg-surface-900/40 overflow-hidden hover:border-surface-600 transition-all cursor-pointer">
                      {/* Preview */}
                      <div className="aspect-square bg-surface-800/50 flex items-center justify-center">
                        <span className="text-4xl opacity-40">{typeIcons[asset.type] ?? typeIcons.default}</span>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-surface-200 truncate">{asset.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge>{asset.type}</Badge>
                          {asset.isFavorite && <span className="text-yellow-400 text-xs">★</span>}
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
