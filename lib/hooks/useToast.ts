import { useToastStore } from "@/lib/stores/toast.store";
import type { ToastVariant } from "@/lib/types/toast.types";

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

function resolve(options: ToastOptions | string): ToastOptions {
  return typeof options === "string" ? { title: options } : options;
}

function buildMethod(variant: ToastVariant) {
  return (options: ToastOptions | string) =>
    useToastStore.getState().add({ ...resolve(options), variant });
}

export const toast = {
  default: buildMethod("default"),
  success: buildMethod("success"),
  danger: buildMethod("danger"),
  error: buildMethod("danger"),
  warning: buildMethod("warning"),
  info: buildMethod("info"),
};

export function useToast() {
  const { add, remove } = useToastStore();

  function createMethod(variant: ToastVariant) {
    return (options: ToastOptions | string) =>
      add({ ...resolve(options), variant });
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
    remove,
  };
}
