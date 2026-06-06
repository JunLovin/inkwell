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
