import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
/**
 * Chat message within a conversation.
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata: {
        intent: string | null;
        pipelineId: string | null;
        projectId: string | null;
        attachments: Array<{
            type: string;
            url: string;
            name: string;
        }>;
        tokens: {
            input: number;
            output: number;
        } | null;
    };
    timestamp: Date;
}
/**
 * Conversation document.
 */
export interface Conversation {
    id: string;
    userId: string;
    projectId: string | null;
    title: string;
    messages: ChatMessage[];
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ConversationRepository extends BaseRepository<Conversation> {
    /** Maximum messages stored in the main document before archiving */
    private static readonly MAX_MESSAGES_IN_DOC;
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): Conversation;
    protected toFirestore(entity: Partial<Conversation>): Record<string, unknown>;
    /**
     * Find all conversations for a user.
     */
    findByUser(userId: string, options: PaginationOptions): Promise<PaginatedResult<Conversation>>;
    /**
     * Add a message to a conversation.
     * Automatically archives old messages when the limit is reached.
     */
    addMessage(conversationId: string, message: ChatMessage): Promise<void>;
    /**
     * Create a new conversation with an initial message.
     */
    createWithMessage(userId: string, message: ChatMessage, title?: string): Promise<Conversation>;
    /**
     * Update conversation title.
     */
    updateTitle(conversationId: string, title: string): Promise<void>;
    /**
     * Archive old messages to a subcollection.
     */
    private archiveMessages;
    /**
     * Generate a short title from the first message.
     */
    private generateTitle;
}
//# sourceMappingURL=conversation.repository.d.ts.map