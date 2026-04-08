import { addToast, removeToast } from "@/lib/store/slices/config/configSlice";
import type { ToastVariant } from "@/lib/types/toast.types";
import { AppDispatch, store } from "@/lib/store/store";
import { useDispatch } from "react-redux";

export type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

function buildToast(variant: ToastVariant, options: ToastOptions | string) {
  const resolved = typeof options === "string" ? { title: options } : options;
  return { id: generateId(), variant, ...resolved };
}

export const toast = {
  default: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("default", options))),
  success: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("success", options))),
  danger: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("danger", options))),
  error: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("danger", options))),
  warning: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("warning", options))),
  info: (options: ToastOptions | string) =>
    store.dispatch(addToast(buildToast("info", options))),
};

export function useToast() {
  const dispatch = useDispatch<AppDispatch>();

  function createMethod(variant: ToastVariant) {
    return (options: ToastOptions | string) => {
      dispatch(addToast(buildToast(variant, options)));
    };
  }

  return {
    toast: {
      default: createMethod("default"),
      success: createMethod("success"),
      danger: createMethod("danger"),
      error: createMethod("danger"),
      warning: createMethod("warning"),
      info: createMethod("info"),
    },
    remove: (id: string) => dispatch(removeToast(id)),
  };
}
