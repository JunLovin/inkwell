import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { resetToastStore, useToastStore } from "@/shared/stores/toast.store";
import type { NoteId } from "../../domain/entities/note";
import { useAutoSaveNote } from "./use-autosave-note";

const NOTE_ID = "note_1" as NoteId;
const DELAY = 50;

describe("useAutoSaveNote", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToastStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetToastStore();
  });

  const setup = (updateNote = vi.fn(async () => {})) =>
    renderHook(() =>
      useAutoSaveNote({ noteId: NOTE_ID, updateNote, delayMs: DELAY }),
    );

  it("starts in the idle status", () => {
    const { result } = setup();
    expect(result.current.saveStatus).toBe("idle");
  });

  it("flips to saving immediately when scheduleAutoSave is called", () => {
    const { result } = setup();
    act(() => {
      result.current.scheduleAutoSave("hi", "content", "preview");
    });
    expect(result.current.saveStatus).toBe("saving");
  });

  it("collapses rapid calls into a single updateNote after the delay", async () => {
    const updateNote = vi.fn(async () => {});
    const { result } = setup(updateNote);
    act(() => {
      result.current.scheduleAutoSave("a", "1", "p");
      result.current.scheduleAutoSave("b", "2", "p");
      result.current.scheduleAutoSave("c", "3", "p");
    });
    expect(updateNote).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY);
    });
    expect(updateNote).toHaveBeenCalledTimes(1);
    expect(updateNote).toHaveBeenCalledWith({
      id: NOTE_ID,
      title: "c",
      content: "3",
      preview: "p",
    });
  });

  it("falls back to 'Untitled' when the title is empty after trim", async () => {
    const updateNote = vi.fn(async () => {});
    const { result } = setup(updateNote);
    act(() => {
      result.current.scheduleAutoSave("   ", "x", "p");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY);
    });
    expect(updateNote).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Untitled" }),
    );
  });

  it("transitions saving -> saved -> idle on success", async () => {
    const { result } = setup();
    act(() => {
      result.current.scheduleAutoSave("hi", "x", "p");
    });
    expect(result.current.saveStatus).toBe("saving");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY);
    });
    expect(result.current.saveStatus).toBe("saved");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.saveStatus).toBe("idle");
  });

  it("moves to error state and retries once before toasting when updateNote rejects", async () => {
    const updateNote = vi.fn(async () => {
      throw new Error("boom");
    });
    const { result } = setup(updateNote);
    act(() => {
      result.current.scheduleAutoSave("hi", "x", "p");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY);
    });
    expect(result.current.saveStatus).toBe("error");
    expect(useToastStore.getState().toasts).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(updateNote).toHaveBeenCalledTimes(2);
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      title: "Failed to save note",
      variant: "danger",
    });
  });

  it("is a no-op when noteId is undefined", () => {
    const updateNote = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useAutoSaveNote({
        noteId: undefined,
        updateNote,
        delayMs: DELAY,
      }),
    );
    act(() => {
      result.current.scheduleAutoSave("hi", "x", "p");
    });
    expect(result.current.saveStatus).toBe("idle");
    expect(updateNote).not.toHaveBeenCalled();
  });

  it("clears pending timers on unmount", async () => {
    const updateNote = vi.fn(async () => {});
    const { unmount } = setup(updateNote);
    unmount();
    await vi.advanceTimersByTimeAsync(DELAY * 4);
    expect(updateNote).not.toHaveBeenCalled();
  });
});
