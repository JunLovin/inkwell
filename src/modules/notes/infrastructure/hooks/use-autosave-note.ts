"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/shared/hooks/use-toast";
import type { NoteId } from "../../domain/entities/note";
import type { UpdateNoteInput } from "../../domain/repositories/note.repository";
import {
  AUTOSAVE_DELAY_MS,
  AUTOSAVE_RETRY_MS,
  SAVE_STATUS_DISPLAY_MS,
  type SaveStatus,
} from "../../domain/services/editor-constants";

type UpdateNoteFn = (input: UpdateNoteInput) => Promise<void>;

type UseAutoSaveNoteParams = {
  noteId: NoteId | undefined;
  updateNote: UpdateNoteFn;
  delayMs?: number;
};

type PendingSave = {
  title: string;
  content: string;
  preview: string;
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
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingSave | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const runSaveRef = useRef<
    (id: NoteId, pending: PendingSave, isRetry: boolean) => Promise<void>
  >(async () => {});

  useEffect(() => {
    runSaveRef.current = async (
      id: NoteId,
      pending: PendingSave,
      isRetry: boolean,
    ) => {
      try {
        await updateNote({
          id,
          title: pending.title.trim() || "Untitled",
          content: pending.content,
          preview: pending.preview,
        });
        pendingRef.current = null;
        setSaveStatus("saved");
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(
          () => setSaveStatus("idle"),
          SAVE_STATUS_DISPLAY_MS,
        );
      } catch {
        setSaveStatus("error");
        if (isRetry) {
          toast.error({ title: "Failed to save note" });
          return;
        }
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          const buffered = pendingRef.current;
          if (!buffered) return;
          void runSaveRef.current(id, buffered, true);
        }, AUTOSAVE_RETRY_MS);
      }
    };
  }, [updateNote, toast]);

  const scheduleAutoSave = useCallback(
    (title: string, content: string, preview: string) => {
      if (!noteId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      pendingRef.current = { title, content, preview };
      setSaveStatus("saving");
      saveTimerRef.current = setTimeout(() => {
        const buffered = pendingRef.current;
        if (!buffered) return;
        void runSaveRef.current(noteId, buffered, false);
      }, delayMs);
    },
    [noteId, delayMs],
  );

  return { scheduleAutoSave, saveStatus };
}
