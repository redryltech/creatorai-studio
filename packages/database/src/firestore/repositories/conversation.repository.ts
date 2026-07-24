// ============================================================
// CreatorAI Studio — Conversation Repository
// ============================================================

import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../collections';
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
    attachments: Array<{ type: string; url: string; name: string }>;
    tokens: { input: number; output: number } | null;
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

export class ConversationRepository extends BaseRepository<Conversation> {
  /** Maximum messages stored in the main document before archiving */
  private static readonly MAX_MESSAGES_IN_DOC = 100;

  constructor(db: Firestore) {
    super(db, COLLECTIONS.CONVERSATIONS);
  }

  protected fromFirestore(doc: DocumentSnapshot): Conversation {
    const data = doc.data()!;
    return {
      id: doc.id,
      userId: data.userId,
      projectId: data.projectId ?? null,
      title: data.title ?? 'New Conversation',
      messages: (data.messages ?? []).map((msg: Record<string, unknown>) => ({
        ...msg,
        timestamp: (msg.timestamp as { toDate: () => Date })?.toDate?.() ?? new Date(),
      })),
      messageCount: data.messageCount ?? 0,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  }

  protected toFirestore(entity: Partial<Conversation>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /**
   * Find all conversations for a user.
   */
  async findByUser(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Conversation>> {
    return this.findPaginated(
      (ref) => ref.where('userId', '==', userId),
      { ...options, orderBy: 'updatedAt' },
    );
  }

  /**
   * Add a message to a conversation.
   * Automatically archives old messages when the limit is reached.
   */
  async addMessage(conversationId: string, message: ChatMessage): Promise<void> {
    const conversation = await this.findByIdOrThrow(conversationId);

    // Archive old messages if we're at the limit
    if (conversation.messages.length >= ConversationRepository.MAX_MESSAGES_IN_DOC) {
      await this.archiveMessages(conversationId, conversation.messages.slice(0, 50));
      // Keep the last 50 messages + new one
      const remainingMessages = conversation.messages.slice(50);
      await this.collection.doc(conversationId).update({
        messages: [...remainingMessages, message],
        messageCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    } else {
      await this.collection.doc(conversationId).update({
        messages: FieldValue.arrayUnion(message),
        messageCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Create a new conversation with an initial message.
   */
  async createWithMessage(
    userId: string,
    message: ChatMessage,
    title?: string,
  ): Promise<Conversation> {
    const { generateId, ID_PREFIXES } = await import('@creatorai/shared');
    const conversationId = generateId(ID_PREFIXES.conversation);

    const conversation: Conversation = {
      id: conversationId,
      userId,
      projectId: null,
      title: title ?? this.generateTitle(message.content),
      messages: [message],
      messageCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.create(conversation);
  }

  /**
   * Update conversation title.
   */
  async updateTitle(conversationId: string, title: string): Promise<void> {
    await this.collection.doc(conversationId).update({
      title,
      updatedAt: new Date(),
    });
  }

  /**
   * Archive old messages to a subcollection.
   */
  private async archiveMessages(
    conversationId: string,
    messages: ChatMessage[],
  ): Promise<void> {
    const { generateId, ID_PREFIXES } = await import('@creatorai/shared');
    const batchId = generateId(ID_PREFIXES.message);
    const historyRef = this.collection
      .doc(conversationId)
      .collection(COLLECTIONS.HISTORY)
      .doc(batchId);

    await historyRef.set({
      messages,
      archivedAt: new Date(),
      messageRange: {
        from: messages[0]?.timestamp,
        to: messages[messages.length - 1]?.timestamp,
      },
    });
  }

  /**
   * Generate a short title from the first message.
   */
  private generateTitle(message: string): string {
    const cleaned = message.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 60) return cleaned;
    return cleaned.slice(0, 57) + '...';
  }
}
