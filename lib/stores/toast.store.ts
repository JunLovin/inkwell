import { create } from "zustand";

export type ToastVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    return id;
  },

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
