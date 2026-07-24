import type { Response } from 'express';
/**
 * SSE event to broadcast.
 */
export interface SSEEvent {
    event: string;
    data: Record<string, unknown>;
    userId: string;
    pipelineId?: string;
    projectId?: string;
}
export declare class SSEManager {
    private static instance;
    private clients;
    private heartbeatInterval;
    private constructor();
    static getInstance(): SSEManager;
    static resetInstance(): void;
    /**
     * Register a new SSE client connection.
     * Called when a client connects to the events endpoint.
     *
     * @param clientId - Unique connection ID
     * @param userId - Authenticated user ID
     * @param res - Express Response object (kept open for streaming)
     * @param filters - Optional event filters
     */
    addClient(clientId: string, userId: string, res: Response, filters?: {
        pipelineId?: string;
        projectId?: string;
    }): void;
    /**
     * Broadcast an event to matching clients.
     * Events are scoped by userId and optionally by pipelineId/projectId.
     */
    broadcast(event: SSEEvent): void;
    /**
     * Send an event to a specific user.
     */
    sendToUser(userId: string, event: string, data: Record<string, unknown>): void;
    /**
     * Get the number of connected clients.
     */
    get clientCount(): number;
    /**
     * Get connected client count for a specific user.
     */
    getUserClientCount(userId: string): number;
    /**
     * Determine if a client should receive an event based on user and filters.
     */
    private shouldReceive;
    /**
     * Send heartbeat comments to keep connections alive.
     * SSE spec says lines starting with : are comments and ignored by clients.
     */
    private sendHeartbeats;
}
//# sourceMappingURL=sse-manager.d.ts.map