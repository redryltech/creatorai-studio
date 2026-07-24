// ============================================================
// CreatorAI Studio — Conversation Repository
// ============================================================
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../collections';
import { BaseRepository } from './base.repository';
export class ConversationRepository extends BaseRepository {
    /** Maximum messages stored in the main document before archiving */
    static MAX_MESSAGES_IN_DOC = 100;
    constructor(db) {
        super(db, COLLECTIONS.CONVERSATIONS);
    }
    fromFirestore(doc) {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            projectId: data.projectId ?? null,
            title: data.title ?? 'New Conversation',
            messages: (data.messages ?? []).map((msg) => ({
                ...msg,
                timestamp: msg.timestamp?.toDate?.() ?? new Date(),
            })),
            messageCount: data.messageCount ?? 0,
            createdAt: data.createdAt?.toDate() ?? new Date(),
            updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
    }
    toFirestore(entity) {
        const data = { ...entity };
        delete data.id;
        return data;
    }
    /**
     * Find all conversations for a user.
     */
    async findByUser(userId, options) {
        return this.findPaginated((ref) => ref.where('userId', '==', userId), { ...options, orderBy: 'updatedAt' });
    }
    /**
     * Add a message to a conversation.
     * Automatically archives old messages when the limit is reached.
     */
    async addMessage(conversationId, message) {
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
        }
        else {
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
    async createWithMessage(userId, message, title) {
        const { generateId, ID_PREFIXES } = await import('@creatorai/shared');
        const conversationId = generateId(ID_PREFIXES.conversation);
        const conversation = {
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
    async updateTitle(conversationId, title) {
        await this.collection.doc(conversationId).update({
            title,
            updatedAt: new Date(),
        });
    }
    /**
     * Archive old messages to a subcollection.
     */
    async archiveMessages(conversationId, messages) {
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
    generateTitle(message) {
        const cleaned = message.trim().replace(/\s+/g, ' ');
        if (cleaned.length <= 60)
            return cleaned;
        return cleaned.slice(0, 57) + '...';
    }
}
//# sourceMappingURL=conversation.repository.js.map