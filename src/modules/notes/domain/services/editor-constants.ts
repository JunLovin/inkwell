export const AUTOSAVE_DELAY_MS = 3000;
export const SAVE_STATUS_DISPLAY_MS = 2000;
export const AUTOSAVE_RETRY_MS = 5000;
export const PREVIEW_CHAR_LIMIT = 150;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const saveStatusColor: Record<SaveStatus, string> = {
  idle: "text-transparent",
  saving: "text-zinc-600",
  saved: "text-zinc-500",
  error: "text-amber-400",
};

export const saveStatusShortLabel: Record<SaveStatus, string> = {
  idle: "Saved",
  saving: "Saving...",
  saved: "Saved",
  error: "Unsaved",
};

export const saveStatusLongLabel: Record<SaveStatus, string> = {
  idle: "All changes saved",
  saving: "Saving...",
  saved: "Saved",
  error: "Unsaved — retrying",
};
