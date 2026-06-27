"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/shared/hooks/use-toast";
import type { NoteId } from "../../domain/entities/note";
import type { UpdateNoteInput } from "../../domain/repositories/note.repository";
import {
  AUTOSAVE_DELAY_MS,
  SAVE_STATUS_DISPLAY_MS,
  type SaveStatus,
} from "../../domain/services/editor-constants";

type UpdateNoteFn = (input: UpdateNoteInput) => Promise<void>;

type UseAutoSaveNoteParams = {
  noteId: NoteId | undefined;
  updateNote: UpdateNoteFn;
  delayMs?: number;
};

export function useAutoSaveNote({
  noteId,
  updateNote,
  delayMs = AUTOSAVE_DELAY_MS,
}: UseAutoSaveNoteParams) {
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const scheduleAutoSave = useCallback(
    (title: string, content: string, preview: string) => {
      if (!noteId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus("saving");
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateNote({
            id: noteId,
            title: title.trim() || "Untitled",
            content,
            preview,
          });
          setSaveStatus("saved");
          if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
          statusTimerRef.current = setTimeout(
            () => setSaveStatus("idle"),
            SAVE_STATUS_DISPLAY_MS,
          );
        } catch {
          setSaveStatus("idle");
          toast.error({ title: "Failed to save note" });
        }
      }, delayMs);
    },
    [noteId, updateNote, toast, delayMs],
  );

  return { scheduleAutoSave, saveStatus };
}
