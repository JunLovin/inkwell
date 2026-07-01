export const AUTOSAVE_DELAY_MS = 3000;
export const SAVE_STATUS_DISPLAY_MS = 2000;
export const PREVIEW_CHAR_LIMIT = 150;

export type SaveStatus = "idle" | "saving" | "saved";

export const saveStatusColor: Record<SaveStatus, string> = {
  idle: "text-transparent",
  saving: "text-zinc-600",
  saved: "text-zinc-500",
};

export const saveStatusShortLabel: Record<SaveStatus, string> = {
  idle: "Saved",
  saving: "Saving...",
  saved: "Saved",
};

export const saveStatusLongLabel: Record<SaveStatus, string> = {
  idle: "All changes saved",
  saving: "Saving...",
  saved: "Saved",
};
