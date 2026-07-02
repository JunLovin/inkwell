import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Note } from "../../../domain/entities/note";
import { makeNote as baseMakeNote } from "../../../__test-utils__/factories";
import { NoteCard } from "./NoteCard";

const makeNote = (overrides: Partial<Note> = {}): Note =>
  baseMakeNote({
    title: "My note",
    preview: "preview text",
    ...overrides,
  });

describe("NoteCard", () => {
  it("renders title and preview", () => {
    render(<NoteCard note={makeNote()} />);
    expect(screen.getByText("My note")).toBeInTheDocument();
    expect(screen.getByText("preview text")).toBeInTheDocument();
  });

  it('falls back to "Untitled" when title is empty', () => {
    render(<NoteCard note={makeNote({ title: "" })} />);
    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  it("fires onClick when the card is clicked", () => {
    const onClick = vi.fn();
    render(<NoteCard note={makeNote()} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /My note/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders pin/favorite/archive/delete buttons when handlers are provided", () => {
    const onPin = vi.fn();
    const onFavorite = vi.fn();
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    render(
      <NoteCard
        note={makeNote()}
        onPin={onPin}
        onFavorite={onFavorite}
        onArchive={onArchive}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByLabelText("Pin note")).toBeInTheDocument();
  });

  it("calls onPin and stops propagation", () => {
    const onClick = vi.fn();
    const onPin = vi.fn();
    render(<NoteCard note={makeNote()} onClick={onClick} onPin={onPin} />);
    fireEvent.click(screen.getByLabelText("Pin note"));
    expect(onPin).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows "Unpin note" when pinned', () => {
    render(<NoteCard note={makeNote({ isPinned: true })} onPin={() => {}} />);
    expect(screen.getByLabelText("Unpin note")).toBeInTheDocument();
  });

  it("renders selectable state with aria-pressed", () => {
    render(<NoteCard note={makeNote()} selectable selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("does not render actions when selectable is true", () => {
    render(
      <NoteCard
        note={makeNote()}
        selectable
        onPin={() => {}}
        onFavorite={() => {}}
      />,
    );
    expect(screen.queryByLabelText("Pin note")).not.toBeInTheDocument();
  });
});
