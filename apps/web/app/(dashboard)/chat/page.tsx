'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSSE } from '@/hooks/use-sse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/components/chat/chat-message';
import { WorkflowProgress } from '@/components/chat/workflow-progress';
import { cn } from '@/lib/utils';

interface WorkflowNode { nodeId: string; label: string; agentId: string; status: string; progress: number; durationMs?: number; }

export default function ChatPage() {
  const { messages, isProcessing, error, sendMessage, startNewConversation } = useChatStore();
  const user = useAuthStore((s) => s.user);

  const [input, setInput] = useState('');
  const [activeWorkflow, setActiveWorkflow] = useState<{ runId: string; progress: number; status: string; nodes: WorkflowNode[]; cost?: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeWorkflow?.progress]);

  // SSE: live workflow updates
  const handleSSEEvent = useCallback((event: { type: string; data: Record<string, unknown> }) => {
    const { type, data } = event;

    if (type === 'node.started') {
      setActiveWorkflow((prev) => {
        if (!prev) return null;
        const nodes = [...prev.nodes];
        const idx = nodes.findIndex((n) => n.nodeId === data.nodeId);
        if (idx >= 0) nodes[idx] = { ...nodes[idx]!, status: 'running', progress: 0 };
        else nodes.push({ nodeId: data.nodeId as string, label: (data.label as string) ?? (data.agentId as string), agentId: data.agentId as string, status: 'running', progress: 0 });
        return { ...prev, nodes };
      });
    } else if (type === 'node.progress') {
      setActiveWorkflow((prev) => {
        if (!prev) return null;
        const nodes = prev.nodes.map((n) => n.nodeId === data.nodeId ? { ...n, progress: (data.progress as number) ?? 0 } : n);
        return { ...prev, progress: (data.progress as number) ?? prev.progress, nodes };
      });
    } else if (type === 'node.completed') {
      setActiveWorkflow((prev) => {
        if (!prev) return null;
        const nodes = prev.nodes.map((n) => n.nodeId === data.nodeId ? { ...n, status: 'completed', progress: 100, durationMs: data.durationMs as number } : n);
        const completed = nodes.filter((n) => n.status === 'completed').length;
        return { ...prev, nodes, progress: Math.round((completed / Math.max(nodes.length, 1)) * 100) };
      });
    } else if (type === 'node.failed') {
      setActiveWorkflow((prev) => {
        if (!prev) return null;
        const nodes = prev.nodes.map((n) => n.nodeId === data.nodeId ? { ...n, status: 'failed' } : n);
        return { ...prev, nodes };
      });
    } else if (type === 'workflow.completed') {
      setActiveWorkflow((prev) => prev ? { ...prev, status: 'completed', progress: 100 } : null);
    } else if (type === 'workflow.failed') {
      setActiveWorkflow((prev) => prev ? { ...prev, status: 'failed' } : null);
    }
  }, []);

  useSSE({
    onEvent: handleSSEEvent,
    enabled: !!activeWorkflow && activeWorkflow.status === 'running',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;
    setInput('');
    await sendMessage(trimmed);

    // Check if a workflow was triggered from the latest message
    const latestMsg = useChatStore.getState().messages.at(-1);
    const meta = latestMsg?.metadata;
    if (meta?.pipelineId) {
      const plan = meta.workflowPlan as any;
      setActiveWorkflow({
        runId: meta.pipelineId,
        progress: 0,
        status: 'running',
        nodes: [],
        cost: plan?.estimatedCostUsd,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const suggestions = [
    'Create 10 YouTube Shorts about electric cars',
    'Generate a motivational video for Instagram',
    'Research trending topics in AI technology',
    'Write a script about space exploration',
    'Create a thumbnail for my latest video',
    'Generate 5 viral content ideas about fitness',
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-surface-100">AI Chat</h1>
          <Badge variant="success">Online</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { startNewConversation(); setActiveWorkflow(null); }}>+ New Chat</Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 max-w-3xl mx-auto">
            <div className="h-16 w-16 rounded-2xl animated-gradient flex items-center justify-center mb-6 shadow-lg shadow-brand-600/20">
              <span className="text-white text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-surface-100 mb-2">What would you like to create?</h2>
            <p className="text-sm text-surface-400 mb-8 text-center max-w-lg">
              Tell me what you want and I&apos;ll handle everything — research, scripts, visuals, voiceovers, editing, and publishing.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {suggestions.map((s) => (
                <button key={s} className="px-4 py-2 rounded-full text-xs font-medium bg-surface-800/50 text-surface-300 border border-surface-700 hover:bg-surface-800 hover:text-surface-100 hover:border-surface-600 transition-all"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-6 space-y-5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} userName={user?.displayName ?? 'You'} />
            ))}

            {/* Workflow progress widget */}
            {activeWorkflow && (
              <WorkflowProgress
                workflowRunId={activeWorkflow.runId}
                overallProgress={activeWorkflow.progress}
                nodes={activeWorkflow.nodes as any}
                status={activeWorkflow.status}
                estimatedCostUsd={activeWorkflow.cost}
              />
            )}

            {isProcessing && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg animated-gradient flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="bg-surface-800/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-surface-700/60">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-surface-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-800 bg-surface-950/80 backdrop-blur-sm p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a command... (e.g., Create 10 YouTube Shorts about electric cars)"
            className={cn(
              'w-full min-h-[52px] max-h-[200px] resize-none rounded-xl',
              'bg-surface-800/50 border border-surface-700 px-4 py-3.5 pr-14',
              'text-sm text-surface-100 placeholder:text-surface-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-600',
              'transition-all duration-150',
            )}
            rows={1} disabled={isProcessing}
          />
          <Button type="submit" size="icon" className="absolute right-2 bottom-2 h-9 w-9" disabled={!input.trim() || isProcessing} loading={isProcessing}>
            {!isProcessing && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </Button>
        </form>
        <p className="text-center mt-2 text-2xs text-surface-600">CreatorAI can make mistakes. Review generated content before publishing.</p>
      </div>
    </div>
  );
}
