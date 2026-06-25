import { create } from "zustand";
import type {
  AttachedFile,
  AttachedNote,
  ChatMessage,
} from "../../domain/entities/chat-message";

type AIChatStore = {
  isOpen: boolean;
  currentContext: string;
  contextMessages: Record<string, ChatMessage[]>;
  attachedNote: AttachedNote | null;
  attachedFiles: AttachedFile[];
  isLoading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setContext: (contextId: string) => void;
  addMessage: (message: Omit<ChatMessage, "id">) => void;
  setAttachedNote: (note: AttachedNote | null) => void;
  addAttachedFile: (file: AttachedFile) => void;
  removeAttachedFile: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearContext: () => void;
  removeLastAssistantMessage: () => void;
};

export const useAIChatStore = create<AIChatStore>((set) => ({
  isOpen: false,
  currentContext: "dashboard",
  contextMessages: {},
  attachedNote: null,
  attachedFiles: [],
  isLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, attachedFiles: [] }),
  toggle: () =>
    set((state) =>
      state.isOpen ? { isOpen: false, attachedFiles: [] } : { isOpen: true },
    ),
  setContext: (contextId) =>
    set((state) => {
      if (state.currentContext === contextId) return {};
      return { currentContext: contextId, attachedNote: null };
    }),
  addMessage: (message) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => {
      const ctx = state.currentContext;
      const prev = state.contextMessages[ctx] ?? [];
      return {
        contextMessages: {
          ...state.contextMessages,
          [ctx]: [...prev, { id, ...message }],
        },
      };
    });
  },
  setAttachedNote: (note) => set({ attachedNote: note }),
  addAttachedFile: (file) =>
    set((state) => ({ attachedFiles: [...state.attachedFiles, file] })),
  removeAttachedFile: (id) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.filter((f) => f.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearContext: () =>
    set((state) => ({
      contextMessages: {
        ...state.contextMessages,
        [state.currentContext]: [],
      },
      attachedFiles: [],
    })),
  removeLastAssistantMessage: () =>
    set((state) => {
      const ctx = state.currentContext;
      const messages = state.contextMessages[ctx] ?? [];
      if (messages.length === 0) return {};
      const last = messages[messages.length - 1];
      if (last.role !== "assistant") return {};
      return {
        contextMessages: {
          ...state.contextMessages,
          [ctx]: messages.slice(0, -1),
        },
      };
    }),
}));
