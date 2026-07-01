import type { Note } from "@/modules/notes";

export const DELETE_CONFIRMATION_PHRASE = "DELETE";

export function todayStamp(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildExportFilename(now: Date = new Date()): string {
  return `inkwell-export-${todayStamp(now)}.json`;
}

export type ExportPayload = {
  exportedAt: string;
  noteCount: number;
  notes: Note[];
};

export function buildExportPayload(
  notes: Note[] | undefined,
  now: Date = new Date(),
): ExportPayload {
  const list = notes ?? [];
  return {
    exportedAt: now.toISOString(),
    noteCount: list.length,
    notes: list,
  };
}

export function isDeleteConfirmed(text: string): boolean {
  return text === DELETE_CONFIRMATION_PHRASE;
}
