import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

import type { Note, NoteId } from "../../../domain/entities/note";
import { makeNote as baseMakeNote } from "../../../__test-utils__/factories";
import { NotesGrid } from "./NotesGrid";

const makeNote = (id: string, overrides: Partial<Note> = {}): Note =>
  baseMakeNote({
    _id: id as NoteId,
    _creationTime: 1,
    authorId: "u" as Note["authorId"],
    slug: id,
    title: `Note ${id}`,
    ...overrides,
  });

describe("NotesGrid", () => {
  it("renders empty state when notes are empty", () => {
    const onCreateNote = vi.fn();
    render(<NotesGrid notes={[]} onCreateNote={onCreateNote} />);
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Create note/i }));
    expect(onCreateNote).toHaveBeenCalledOnce();
  });

  it("renders one card per note", () => {
    render(<NotesGrid notes={[makeNote("a"), makeNote("b"), makeNote("c")]} />);
    expect(screen.getByText("Note a")).toBeInTheDocument();
    expect(screen.getByText("Note b")).toBeInTheDocument();
    expect(screen.getByText("Note c")).toBeInTheDocument();
  });

  it("forwards onNoteClick with the note instance", () => {
    const onNoteClick = vi.fn();
    const note = makeNote("a");
    render(<NotesGrid notes={[note]} onNoteClick={onNoteClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Note a/i }));
    expect(onNoteClick).toHaveBeenCalledWith(note);
  });

  it("marks selected ids", () => {
    const a = makeNote("a");
    render(<NotesGrid notes={[a]} selectable selectedIds={new Set([a._id])} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});
