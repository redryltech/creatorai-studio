'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { useSSE } from '@/hooks/use-sse';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface AutomationTask {
  id: string;
  stage: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  progress: number;
  durationMs?: number;
}

export default function AutomationPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube_shorts');
  const [videoCount, setVideoCount] = useState(5);
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('en');
  const [audience, setAudience] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [status, setStatus] = useState<string>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSSEEvent = useCallback((event: { type: string; data: Record<string, unknown> }) => {
    const { type, data } = event;

    if (type === 'task.started') {
      setTasks((prev) => {
        const existing = prev.find((t) => t.id === data.taskId);
        if (existing) return prev.map((t) => t.id === data.taskId ? { ...t, status: 'running' as const, progress: 0 } : t);
        return [...prev, { id: data.taskId as string, stage: data.stage as string, label: data.label as string, status: 'running', progress: 0 }];
      });
      setCurrentStage(data.stage as string);
    } else if (type === 'task.progress') {
      setTasks((prev) => prev.map((t) => t.id === data.taskId ? { ...t, progress: data.progress as number } : t));
    } else if (type === 'task.completed') {
      setTasks((prev) => prev.map((t) => t.id === data.taskId ? { ...t, status: 'completed', progress: 100, durationMs: data.durationMs as number } : t));
      setOverallProgress((prev) => Math.min(prev + 20, 95));
    } else if (type === 'task.failed') {
      setTasks((prev) => prev.map((t) => t.id === data.taskId ? { ...t, status: 'failed' } : t));
    } else if (type === 'automation.completed') {
      setStatus('completed');
      setOverallProgress(100);
      setIsRunning(false);
    } else if (type === 'automation.failed') {
      setStatus('failed');
      setIsRunning(false);
    }
  }, []);

  useSSE({ onEvent: handleSSEEvent, enabled: isRunning });

  const startAutomation = async () => {
    if (!topic.trim()) return;

    setIsRunning(true);
    setTasks([]);
    setOverallProgress(0);
    setStatus('running');
    setCurrentStage(null);

    try {
      const result = await api.chat.sendMessage({
        conversationId: null,
        message: `AUTOMATION:${JSON.stringify({ topic, platform, videoCount, tone, language, audience })}`,
      });
      setResponseMessage((result as any)?.response?.content ?? 'Automation started');
      setWorkflowId((result as any)?.response?.metadata?.workflowRunId ?? null);
    } catch {
      // Fallback: call automation API directly
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/automation/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, platform, videoCount, tone, language, audience }),
        });
        const data = await resp.json();
        setResponseMessage(data?.data?.message ?? 'Automation started');
        setWorkflowId(data?.data?.workflowId ?? null);
      } catch (err) {
        setStatus('failed');
        setIsRunning(false);
        setResponseMessage('Failed to start automation. Is the backend server running?');
      }
    }
  };

  const stageIcons: Record<string, string> = {
    research: '🔍', planning: '📋', scripting: '📝',
    prompt_optimization: '🎨', image_generation: '🖼️',
    video_generation: '🎬', voice_generation: '🎙️',
    music_generation: '🎵', media: '📦',
    timeline: '🎞️', captions: '💬', transitions: '✨',
    effects: '🌟', rendering: '⚙️', quality: '✅',
    editing: '✂️', review: '👁️',
    seo: '🔍', publishing: '📤',
    validation: '✅', verification: '🔒',
  };

  const statusColors: Record<string, string> = {
    pending: 'text-surface-500', running: 'text-brand-400',
    completed: 'text-green-400', failed: 'text-red-400', retrying: 'text-yellow-400',
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Automation Studio"
        badge={status !== 'idle' ? <Badge variant={status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'info'}>{status}</Badge> : undefined}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ---- Configuration Form ---- */}
          <Card>
            <CardHeader><CardTitle>🚀 Create Content Automation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-surface-400 mb-1 block">Topic *</label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Electric vehicles, AI technology, Morning routines" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Platform</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                      <option value="youtube_shorts">YouTube Shorts</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram_reels">Instagram Reels</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X (Twitter)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Videos</label>
                    <input type="number" min={1} max={50} value={videoCount} onChange={(e) => setVideoCount(Number(e.target.value))} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="dramatic">Dramatic</option>
                      <option value="humorous">Humorous</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-surface-400 mb-1 block">Target Audience (optional)</label>
                  <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Tech enthusiasts aged 18-35" />
                </div>

                <Button size="lg" className="w-full" onClick={startAutomation} disabled={!topic.trim() || isRunning} loading={isRunning}>
                  {isRunning ? 'Running Automation...' : `🚀 Generate ${videoCount} Videos`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ---- Response Message ---- */}
          {responseMessage && (
            <Card>
              <CardContent>
                <pre className="text-sm text-surface-200 whitespace-pre-wrap font-sans">{responseMessage}</pre>
              </CardContent>
            </Card>
          )}

          {/* ---- Live Execution Progress ---- */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Execution</CardTitle>
                <Badge variant={status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'info'}>{status}</Badge>
              </CardHeader>
              <CardContent>
                <ProgressBar value={overallProgress} size="sm" color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'brand'} className="mb-4" />

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800/40 transition-colors">
                      <span className="text-base">{stageIcons[task.stage] ?? '▶️'}</span>
                      <span className={cn('text-xs flex-1', statusColors[task.status] ?? 'text-surface-400', task.status === 'running' && 'font-medium')}>
                        {task.label}
                      </span>
                      {task.status === 'running' && task.progress > 0 && (
                        <span className="text-2xs text-brand-400">{task.progress}%</span>
                      )}
                      {task.status === 'running' && (
                        <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {task.status === 'completed' && (
                        <>
                          <span className="text-green-400 text-xs">✓</span>
                          {task.durationMs && <span className="text-2xs text-surface-500">{(task.durationMs / 1000).toFixed(1)}s</span>}
                        </>
                      )}
                      {task.status === 'failed' && <span className="text-red-400 text-xs">✕</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
