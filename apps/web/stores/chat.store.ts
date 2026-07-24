// ============================================================
// CreatorAI Studio — Chat Store (Zustand)
// ============================================================
// Manages the AI chat interface state: messages, conversations,
// streaming responses, and pipeline triggers.
// ============================================================

import { create } from 'zustand';
import { api } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: unknown;
    pipelineId?: string | null;
    projectIds?: string[];
    isStreaming?: boolean;
  };
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

interface ChatState {
  /** Current conversation ID */
  conversationId: string | null;
  /** Messages in the current conversation */
  messages: ChatMessage[];
  /** List of past conversations */
  conversations: ConversationSummary[];
  /** Whether a message is being processed */
  isProcessing: boolean;
  /** Whether the AI is streaming a response */
  isStreaming: boolean;
  /** Error message */
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  conversations: [],
  isProcessing: false,
  isStreaming: false,
  error: null,

  sendMessage: async (content: string) => {
    const { conversationId, messages } = get();

    // Add user message immediately (optimistic update)
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set({
      messages: [...messages, userMessage],
      isProcessing: true,
      error: null,
    });

    try {
      const response = await api.chat.sendMessage({
        conversationId,
        message: content,
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: response.response.id,
        role: 'assistant',
        content: response.response.content,
        timestamp: new Date(),
        metadata: {
          intent: response.response.metadata.intent,
          pipelineId: response.response.metadata.pipelineId,
          projectIds: response.response.metadata.projectIds,
        },
      };

      set((state) => ({
        conversationId: response.conversationId,
        messages: [...state.messages, assistantMessage],
        isProcessing: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
        isProcessing: false,
      });
    }
  },

  loadConversations: async () => {
    try {
      const response = await api.chat.getConversations({ limit: 50 });
      set({ conversations: response.items });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  },

  loadConversation: async (id: string) => {
    try {
      const conversation = await api.chat.getConversation(id);
      if (conversation) {
        set({
          conversationId: conversation.id,
          messages: conversation.messages.map((msg) => ({
            ...msg,
            role: msg.role as 'user' | 'assistant' | 'system',
            timestamp: new Date(msg.timestamp),
          })),
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load conversation' });
    }
  },

  startNewConversation: () => {
    set({
      conversationId: null,
      messages: [],
      error: null,
    });
  },

  deleteConversation: async (id: string) => {
    try {
      await api.chat.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        ...(state.conversationId === id
          ? { conversationId: null, messages: [] }
          : {}),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete conversation' });
    }
  },

  clearError: () => set({ error: null }),
}));
