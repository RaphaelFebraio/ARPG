import type { ChunkMetadata } from '@grimoire/shared';
import { create } from 'zustand';
import { ApiError, rulesApi } from '../services/api';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChunkMetadata[];
};

type ChatState = {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (query: string) => Promise<void>;
};

// DECISION: a random-ish id is enough for a client-only list key; these
// messages aren't persisted or synced anywhere.
const nextId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,

  sendMessage: async (query) => {
    const trimmed = query.trim();
    if (!trimmed || get().loading) return;

    const userMessage: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
    set((state) => ({ messages: [...state.messages, userMessage], loading: true }));

    try {
      const result = await rulesApi.query({ query: trimmed });
      const assistantMessage: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
      };
      set((state) => ({ messages: [...state.messages, assistantMessage] }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não consegui falar com o servidor. Verifique se ele está rodando.';
      const errorMessage: ChatMessage = { id: nextId(), role: 'assistant', content: message };
      set((state) => ({ messages: [...state.messages, errorMessage] }));
    } finally {
      set({ loading: false });
    }
  },
}));
