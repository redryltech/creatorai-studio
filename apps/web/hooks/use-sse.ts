// ============================================================
// CreatorAI Studio — SSE Hook
// ============================================================
// Connects to the server's SSE endpoint and dispatches
// typed events to callback handlers. Auto-reconnects on
// connection loss.
// ============================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getClientAuth } from '@/lib/firebase';

interface SSEOptions {
  /** Only receive events for this pipeline/workflow */
  workflowRunId?: string;
  /** Only receive events for this project */
  projectId?: string;
  /** Handler for each event */
  onEvent: (event: { type: string; data: Record<string, unknown> }) => void;
  /** Handler for connection status changes */
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
  /** Whether the hook is enabled (set false to disconnect) */
  enabled?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;

export function useSSE(options: SSEOptions) {
  const { onEvent, onStatusChange, workflowRunId, projectId, enabled = true } = options;
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable callback refs
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onStatusRef = useRef(onStatusChange);
  onStatusRef.current = onStatusChange;

  const updateStatus = useCallback((s: typeof status) => {
    setStatus(s);
    onStatusRef.current?.(s);
  }, []);

  const connect = useCallback(async () => {
    // Get auth token — in dev mode, proceed without it
    let token = '';
    try {
      const auth = getClientAuth();
      const user = auth.currentUser;
      if (user) {
        token = await user.getIdToken();
      }
    } catch {
      // In development, auth may not be initialized
    }

    // Build URL
    const params = new URLSearchParams();
    if (workflowRunId) params.set('pipelineId', workflowRunId);
    if (projectId) params.set('projectId', projectId);
    const qs = params.toString();
    const url = `${API_BASE}/events/stream${qs ? `?${qs}` : ''}`;

    // EventSource doesn't support headers, so we pass the token as a query param
    // In production, use a proper SSE library or polyfill that supports headers.
    // For now, we'll connect and rely on session-based auth or pass token via query.
    const eventSource = new EventSource(`${url}${qs ? '&' : '?'}token=${token}`);

    updateStatus('connecting');

    eventSource.onopen = () => {
      updateStatus('connected');
      reconnectAttempts.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEventRef.current({ type: event.type || 'message', data });
      } catch { /* ignore malformed */ }
    };

    // Listen to typed events
    const eventTypes = [
      'workflow.started', 'workflow.completed', 'workflow.failed', 'workflow.cancelled',
      'workflow.paused', 'workflow.resumed',
      'node.started', 'node.progress', 'node.completed', 'node.failed', 'node.retrying',
      'job.started', 'job.progress', 'job.completed', 'job.failed',
      'connected',
    ];

    for (const type of eventTypes) {
      eventSource.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEventRef.current({ type, data });
        } catch { /* ignore */ }
      });
    }

    eventSource.onerror = () => {
      eventSource.close();
      updateStatus('disconnected');

      // Reconnect with exponential backoff
      const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current), MAX_RECONNECT_DELAY);
      reconnectAttempts.current++;

      reconnectTimer.current = setTimeout(() => {
        if (enabled) connect();
      }, delay);
    };

    eventSourceRef.current = eventSource;
  }, [workflowRunId, projectId, enabled, updateStatus]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      updateStatus('disconnected');
    };
  }, [enabled, connect, updateStatus]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    updateStatus('disconnected');
  }, [updateStatus]);

  return { status, disconnect };
}
