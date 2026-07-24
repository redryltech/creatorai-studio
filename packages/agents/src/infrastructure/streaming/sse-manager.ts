// ============================================================
// CreatorAI Studio — SSE (Server-Sent Events) Manager
// ============================================================
// Manages real-time streaming connections to clients.
//
// Used for:
// - Pipeline progress updates (step started, progress, completed, failed)
// - Chat response streaming (token-by-token LLM output)
// - Job status updates (image gen progress, video gen progress)
//
// Each client connects to GET /api/v1/events/stream?userId=xxx
// and receives all events scoped to their user ID.
// ============================================================

import type { Response } from 'express';
import { Logger } from '../logger';

const log = Logger.for('SSEManager');

/**
 * A connected SSE client.
 */
interface SSEClient {
  id: string;
  userId: string;
  response: Response;
  connectedAt: Date;
  lastEventAt: Date;
  filters: {
    pipelineId?: string;
    projectId?: string;
  };
}

/**
 * SSE event to broadcast.
 */
export interface SSEEvent {
  event: string;               // Event type (e.g., 'pipeline.step.completed')
  data: Record<string, unknown>;
  userId: string;              // Target user (for scoping)
  pipelineId?: string;         // Optional filter
  projectId?: string;          // Optional filter
}

export class SSEManager {
  private static instance: SSEManager | null = null;
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Send heartbeat every 30s to keep connections alive through proxies/load balancers
    this.heartbeatInterval = setInterval(() => this.sendHeartbeats(), 30000);
  }

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  static resetInstance(): void {
    if (SSEManager.instance?.heartbeatInterval) {
      clearInterval(SSEManager.instance.heartbeatInterval);
    }
    SSEManager.instance = null;
  }

  /**
   * Register a new SSE client connection.
   * Called when a client connects to the events endpoint.
   *
   * @param clientId - Unique connection ID
   * @param userId - Authenticated user ID
   * @param res - Express Response object (kept open for streaming)
   * @param filters - Optional event filters
   */
  addClient(
    clientId: string,
    userId: string,
    res: Response,
    filters: { pipelineId?: string; projectId?: string } = {},
  ): void {
    // Configure SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',        // Disable nginx buffering
      'Access-Control-Allow-Origin': '*', // CORS for SSE
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    const client: SSEClient = {
      id: clientId,
      userId,
      response: res,
      connectedAt: new Date(),
      lastEventAt: new Date(),
      filters,
    };

    this.clients.set(clientId, client);

    // Clean up on disconnect
    res.on('close', () => {
      this.clients.delete(clientId);
      log.debug('SSE client disconnected', { clientId, userId });
    });

    log.debug('SSE client connected', {
      clientId,
      userId,
      filters,
      totalClients: this.clients.size,
    });
  }

  /**
   * Broadcast an event to matching clients.
   * Events are scoped by userId and optionally by pipelineId/projectId.
   */
  broadcast(event: SSEEvent): void {
    let recipientCount = 0;

    for (const client of this.clients.values()) {
      if (!this.shouldReceive(client, event)) continue;

      try {
        const payload = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
        client.response.write(payload);
        client.lastEventAt = new Date();
        recipientCount++;
      } catch (error) {
        // Connection broken — will be cleaned up by close handler
        log.debug('Failed to send SSE event, removing client', {
          clientId: client.id,
          userId: client.userId,
        });
        this.clients.delete(client.id);
      }
    }

    if (recipientCount > 0) {
      log.debug('SSE event broadcast', {
        event: event.event,
        userId: event.userId,
        recipientCount,
      });
    }
  }

  /**
   * Send an event to a specific user.
   */
  sendToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.broadcast({
      event,
      data,
      userId,
    });
  }

  /**
   * Get the number of connected clients.
   */
  get clientCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected client count for a specific user.
   */
  getUserClientCount(userId: string): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.userId === userId) count++;
    }
    return count;
  }

  // ---- Private ----

  /**
   * Determine if a client should receive an event based on user and filters.
   */
  private shouldReceive(client: SSEClient, event: SSEEvent): boolean {
    // Must match user
    if (client.userId !== event.userId) return false;

    // If client has a pipeline filter, only send matching pipeline events
    if (client.filters.pipelineId && event.pipelineId) {
      if (client.filters.pipelineId !== event.pipelineId) return false;
    }

    // If client has a project filter, only send matching project events
    if (client.filters.projectId && event.projectId) {
      if (client.filters.projectId !== event.projectId) return false;
    }

    return true;
  }

  /**
   * Send heartbeat comments to keep connections alive.
   * SSE spec says lines starting with : are comments and ignored by clients.
   */
  private sendHeartbeats(): void {
    const now = new Date();

    for (const client of this.clients.values()) {
      try {
        client.response.write(`: heartbeat ${now.toISOString()}\n\n`);
      } catch {
        this.clients.delete(client.id);
      }
    }
  }
}
