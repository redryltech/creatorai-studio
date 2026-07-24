'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface WorkflowNode {
  nodeId: string;
  label: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  durationMs?: number;
}

interface Props {
  workflowRunId: string;
  overallProgress: number;
  nodes: WorkflowNode[];
  status: string;
  estimatedCostUsd?: number;
}

const statusIcons: Record<string, string> = {
  pending: '○',
  running: '◉',
  completed: '✓',
  failed: '✕',
  skipped: '—',
};

const statusColors: Record<string, string> = {
  pending: 'text-surface-500',
  running: 'text-brand-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  skipped: 'text-surface-600',
};

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'default',
  running: 'info',
  completed: 'success',
  failed: 'danger',
  skipped: 'default',
};

export function WorkflowProgress({ workflowRunId, overallProgress, nodes, status, estimatedCostUsd }: Props) {
  return (
    <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-surface-100">Workflow</span>
          <Badge variant={status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'info'}>
            {status}
          </Badge>
        </div>
        {estimatedCostUsd !== undefined && (
          <span className="text-2xs text-surface-400">Est. ${estimatedCostUsd.toFixed(2)}</span>
        )}
      </div>

      {/* Overall progress */}
      <ProgressBar
        value={overallProgress}
        size="sm"
        color={status === 'failed' ? 'red' : status === 'completed' ? 'green' : 'brand'}
      />

      {/* Node list */}
      <div className="space-y-1.5">
        {nodes.map((node) => (
          <div key={node.nodeId} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-800/40 transition-colors">
            <span className={cn('text-sm font-mono', statusColors[node.status])}>
              {node.status === 'running' ? (
                <span className="inline-block w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              ) : statusIcons[node.status]}
            </span>
            <span className={cn('text-xs flex-1 truncate', node.status === 'completed' ? 'text-surface-300' : node.status === 'running' ? 'text-surface-100 font-medium' : 'text-surface-400')}>
              {node.label}
            </span>
            {node.status === 'running' && node.progress > 0 && (
              <span className="text-2xs text-brand-400">{node.progress}%</span>
            )}
            {node.status === 'completed' && node.durationMs && (
              <span className="text-2xs text-surface-500">{(node.durationMs / 1000).toFixed(1)}s</span>
            )}
            {node.status === 'failed' && (
              <Badge variant="danger">failed</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
