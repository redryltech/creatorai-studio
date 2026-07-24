'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

const monitorTabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'providers', label: 'Providers', icon: '🔌' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'costs', label: 'Costs', icon: '💰' },
];

// In production, these would come from api.dashboard.getMetrics(), api.dashboard.getHealth(), etc.
const mockProviders = [
  { id: 'openai', name: 'OpenAI', status: 'healthy', latencyMs: 320, errorRate: '0.5%', requests: 1247, circuitOpen: false },
  { id: 'replicate', name: 'Replicate', status: 'healthy', latencyMs: 8500, errorRate: '2.1%', requests: 89, circuitOpen: false },
  { id: 'elevenlabs', name: 'ElevenLabs', status: 'healthy', latencyMs: 1200, errorRate: '0.8%', requests: 156, circuitOpen: false },
];

const mockAgents = [
  { id: 'script', name: 'Script Writer', healthy: true, invocations: 342, avgDuration: '12s', successRate: 98.2 },
  { id: 'prompt', name: 'Prompt Generator', healthy: true, invocations: 310, avgDuration: '8s', successRate: 99.1 },
  { id: 'image', name: 'Image Generator', healthy: true, invocations: 287, avgDuration: '35s', successRate: 95.8 },
  { id: 'voice', name: 'Voice Generator', healthy: true, invocations: 298, avgDuration: '18s', successRate: 97.3 },
];

export default function MonitoringPage() {
  return (
    <div className="h-screen flex flex-col">
      <PageHeader title="Platform Monitoring" badge={<Badge variant="success">All Systems Healthy</Badge>} />

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs tabs={monitorTabs} defaultTab="overview">
          {(tab) => (
            <div>
              {tab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Workflows Today', value: '47', change: '+12%', color: 'text-green-400' },
                      { label: 'Total Cost', value: '$12.83', change: '-3%', color: 'text-green-400' },
                      { label: 'Avg Duration', value: '2.4min', change: '+5%', color: 'text-yellow-400' },
                      { label: 'Success Rate', value: '97.2%', change: '+0.8%', color: 'text-green-400' },
                    ].map((stat) => (
                      <Card key={stat.label}>
                        <p className="text-xs text-surface-400 mb-1">{stat.label}</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-surface-100">{stat.value}</span>
                          <span className={cn('text-2xs font-medium mb-1', stat.color)}>{stat.change}</span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Provider health */}
                  <Card>
                    <CardHeader><CardTitle>Provider Health</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockProviders.map((p) => (
                          <div key={p.id} className="flex items-center gap-4 py-2">
                            <div className={cn('w-2 h-2 rounded-full', p.status === 'healthy' ? 'bg-green-400' : p.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400')} />
                            <span className="text-sm text-surface-100 w-28">{p.name}</span>
                            <Badge variant={p.status === 'healthy' ? 'success' : 'warning'}>{p.status}</Badge>
                            <span className="text-xs text-surface-400 w-24">Latency: {p.latencyMs}ms</span>
                            <span className="text-xs text-surface-400 w-24">Errors: {p.errorRate}</span>
                            <span className="text-xs text-surface-400">{p.requests} req</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {tab === 'providers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockProviders.map((p) => (
                    <Card key={p.id}>
                      <CardHeader>
                        <CardTitle>{p.name}</CardTitle>
                        <Badge variant={p.status === 'healthy' ? 'success' : 'danger'}>{p.status}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-surface-400">Avg Latency</span>
                            <span className="text-surface-200">{p.latencyMs}ms</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-surface-400">Error Rate</span>
                            <span className="text-surface-200">{p.errorRate}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-surface-400">Requests (24h)</span>
                            <span className="text-surface-200">{p.requests}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-surface-400">Circuit Breaker</span>
                            <Badge variant={p.circuitOpen ? 'danger' : 'success'}>{p.circuitOpen ? 'OPEN' : 'CLOSED'}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {tab === 'agents' && (
                <div className="space-y-3">
                  {mockAgents.map((a) => (
                    <Card key={a.id}>
                      <div className="flex items-center gap-4">
                        <div className={cn('w-2.5 h-2.5 rounded-full', a.healthy ? 'bg-green-400' : 'bg-red-400')} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-surface-100">{a.name}</p>
                          <p className="text-xs text-surface-400">{a.invocations} invocations · Avg {a.avgDuration}</p>
                        </div>
                        <ProgressBar value={a.successRate} label="Success Rate" size="sm" className="w-32" color={a.successRate > 97 ? 'green' : a.successRate > 90 ? 'yellow' : 'red'} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {tab === 'costs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Today', value: '$3.21' },
                      { label: 'This Week', value: '$18.47' },
                      { label: 'This Month', value: '$67.92' },
                    ].map((c) => (
                      <Card key={c.label}>
                        <p className="text-xs text-surface-400 mb-1">{c.label}</p>
                        <p className="text-2xl font-bold text-surface-100">{c.value}</p>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Cost by Provider</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'OpenAI', cost: 28.45, pct: 42 },
                          { name: 'Replicate', cost: 22.10, pct: 33 },
                          { name: 'ElevenLabs', cost: 17.37, pct: 25 },
                        ].map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-surface-300">{item.name}</span>
                              <span className="text-surface-200">${item.cost.toFixed(2)}</span>
                            </div>
                            <ProgressBar value={item.pct} size="xs" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
