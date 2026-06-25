import { create } from "zustand";
import { type BoardMessage } from "@/types/chat";

interface ChatState {
  isOpen: boolean;
  messages: BoardMessage[];
  replyingTo: BoardMessage | null;
  unreadCount: number;
  isLoading: boolean;
  
  toggleChat: () => void;
  setMessages: (messages: BoardMessage[]) => void;
  addMessage: (message: BoardMessage) => void;
  setReplyingTo: (message: BoardMessage | null) => void;
  resetChat: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  replyingTo: null,
  unreadCount: 0,
  isLoading: true,

  toggleChat: () =>
    set((state) => ({ 
      isOpen: !state.isOpen,
      unreadCount: !state.isOpen ? 0 : state.unreadCount // Reset unread when opening
    })),

  setMessages: (messages) => set({ messages, isLoading: false }),

  addMessage: (message) =>
    set((state) => {
      // Avoid duplicates from optimistic updates vs realtime events
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: [...state.messages, message],
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      };
    }),

  setReplyingTo: (message) => set({ replyingTo: message }),

  resetChat: () => set({
    isOpen: false,
    messages: [],
    replyingTo: null,
    unreadCount: 0,
    isLoading: true
  }),

  setLoading: (loading) => set({ isLoading: loading })
}));
