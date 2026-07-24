'use client';

import React from 'react';
import { cn, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import type { ChatMessage as ChatMessageType } from '@/stores/chat.store';

interface Props {
  message: ChatMessageType;
  userName: string;
}

export function ChatMessage({ message, userName }: Props) {
  const isUser = message.role === 'user';
  const meta = message.metadata;

  return (
    <div className={cn('flex items-start gap-3 group', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold',
        isUser ? 'bg-surface-700 text-surface-200' : 'animated-gradient text-white',
      )}>
        {isUser ? getInitials(userName) : 'AI'}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-surface-800/50 text-surface-200 border border-surface-700/60 rounded-tl-sm',
      )}>
        {/* Main content — renders markdown-like text */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Workflow plan info */}
        {(meta as any)?.workflowPlan && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium opacity-90">Workflow started</span>
            </div>
            <div className="flex gap-3 text-xs opacity-70">
              <span>⏱️ ~{Math.ceil((meta as any).workflowPlan.estimatedDurationSec / 60)}min</span>
              <span>💰 ${((meta as any).workflowPlan.estimatedCostUsd ?? 0).toFixed(2)}</span>
              <span>📦 {(meta as any).workflowPlan.nodeCount} steps</span>
            </div>
          </div>
        )}

        {/* Intent badges */}
        {meta?.intent && !isUser && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="info">{(meta.intent as any).action?.replace(/_/g, ' ')}</Badge>
            {(meta.intent as any).entities?.platform && (
              <Badge variant="default">{(meta.intent as any).entities.platform}</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
