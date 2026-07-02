import { create } from "zustand";
import type { Toast } from "@/shared/types/toast.types";

type ToastStore = {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = makeId();
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    return id;
  },

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const resetToastStore = () => useToastStore.setState({ toasts: [] });
