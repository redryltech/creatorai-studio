'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/page-header';

export default function BrandProfilesPage() {
  // In production: const brands = useQuery({ queryKey: ['brands'], queryFn: () => api.workspaces.getBrands(workspaceId) })
  const brands: any[] = [];

  return (
    <div className="h-screen flex flex-col">
      <PageHeader title="Brand Profiles" actions={<Button size="sm">+ New Brand</Button>} />

      <div className="flex-1 overflow-y-auto p-6">
        {brands.length === 0 ? (
          <EmptyState
            icon="🎨"
            title="No brand profiles"
            description="Create a brand profile to ensure consistent content across all your projects. Define your voice, colors, audience, and content rules."
            actionLabel="Create Brand Profile"
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand: any) => (
              <Card key={brand.id} hover>
                <CardHeader>
                  <CardTitle>{brand.name}</CardTitle>
                  {brand.isDefault && <Badge variant="info">Default</Badge>}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-surface-400 mb-3">{brand.description || 'No description'}</p>
                  <div className="flex items-center gap-2">
                    {brand.identity?.industry && <Badge>{brand.identity.industry}</Badge>}
                    <div className="flex gap-1 ml-auto">
                      {brand.visualStyle?.primaryColor && (
                        <div className="w-4 h-4 rounded-full border border-surface-600" style={{ backgroundColor: brand.visualStyle.primaryColor }} />
                      )}
                      {brand.visualStyle?.secondaryColor && (
                        <div className="w-4 h-4 rounded-full border border-surface-600" style={{ backgroundColor: brand.visualStyle.secondaryColor }} />
                      )}
                      {brand.visualStyle?.accentColor && (
                        <div className="w-4 h-4 rounded-full border border-surface-600" style={{ backgroundColor: brand.visualStyle.accentColor }} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
