import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/modules/tags", () => ({
  TagPicker: () => null,
}));

vi.mock("@/modules/folders", () => ({
  FolderPicker: () => null,
}));

vi.mock("@lexical/react/LexicalComposer", () => ({
  LexicalComposer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@lexical/react/LexicalContentEditable", () => ({
  ContentEditable: () => <div data-testid="content-editable" />,
}));

vi.mock("@/lib/lexical", () => ({
  createEditorConfig: () => ({}),
  EditorPluginsBundle: () => <div data-testid="plugins" />,
}));

const createNote = vi.fn(async () => ({
  id: "created_id" as NoteId,
  slug: "untitled-abc123",
}));
const updateNote = vi.fn(async () => {});
const archiveNote = vi.fn(async () => {});
const restoreNote = vi.fn(async () => {});
const deleteNote = vi.fn(async () => {});
const favoriteNote = vi.fn(async () => {});
const unfavoriteNote = vi.fn(async () => {});

vi.mock("../../../infrastructure/hooks/use-note-actions", () => ({
  useNoteActions: () => ({
    createNote,
    updateNote,
    archiveNote,
    restoreNote,
    deleteNote,
    favoriteNote,
    unfavoriteNote,
  }),
}));

const scheduleAutoSave = vi.fn();
vi.mock("../../../infrastructure/hooks/use-autosave-note", () => ({
  useAutoSaveNote: () => ({ scheduleAutoSave, saveStatus: "idle" }),
}));

import type { Note, NoteId } from "../../../domain/entities/note";
import { makeNote } from "../../../__test-utils__/factories";
import { NoteDrawer } from "./NoteDrawer";

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe("NoteDrawer", () => {
  beforeEach(() => {
    cleanup();
    push.mockClear();
    createNote.mockClear();
    updateNote.mockClear();
    archiveNote.mockClear();
    restoreNote.mockClear();
    deleteNote.mockClear();
    favoriteNote.mockClear();
    unfavoriteNote.mockClear();
    scheduleAutoSave.mockClear();
  });

  it("renders nothing when closed", () => {
    render(<NoteDrawer note={null} open={false} onClose={() => {}} />);
    expect(screen.queryByTestId("content-editable")).not.toBeInTheDocument();
  });

  it("calls createNote once when opened in create mode", async () => {
    render(<NoteDrawer note={null} open onClose={() => {}} />);
    await flush();
    expect(createNote).toHaveBeenCalledTimes(1);
    expect(createNote).toHaveBeenCalledWith({
      title: "",
      content: "",
      preview: "",
    });
  });

  it("does not call createNote in edit mode", async () => {
    const note = makeNote({
      _id: "existing" as NoteId,
      title: "Existing",
      slug: "existing",
    });
    render(<NoteDrawer note={note} open onClose={() => {}} />);
    await flush();
    expect(createNote).not.toHaveBeenCalled();
  });

  it("does not create a second note on re-render", async () => {
    const { rerender } = render(
      <NoteDrawer note={null} open onClose={() => {}} />,
    );
    await flush();
    rerender(<NoteDrawer note={null} open onClose={() => {}} />);
    await flush();
    expect(createNote).toHaveBeenCalledTimes(1);
  });

  it("resets and can create again after closing and reopening", async () => {
    const { rerender } = render(
      <NoteDrawer note={null} open onClose={() => {}} />,
    );
    await flush();
    expect(createNote).toHaveBeenCalledTimes(1);

    rerender(<NoteDrawer note={null} open={false} onClose={() => {}} />);
    await flush();

    rerender(<NoteDrawer note={null} open onClose={() => {}} />);
    await flush();
    expect(createNote).toHaveBeenCalledTimes(2);
  });

  it("navigates to /dashboard/notes/<slug> when the expand button is clicked", async () => {
    const note = makeNote({
      _id: "n1" as NoteId,
      title: "Hello",
      slug: "hello-abc",
    });
    render(<NoteDrawer note={note} open onClose={() => {}} />);
    await flush();
    fireEvent.click(screen.getByText("Open full note"));
    expect(push).toHaveBeenCalledWith("/dashboard/notes/hello-abc");
  });

  it("schedules an autosave when the title changes", async () => {
    const note = makeNote({
      _id: "n1" as NoteId,
      title: "Hello",
      slug: "hello",
    });
    render(<NoteDrawer note={note} open onClose={() => {}} />);
    await flush();
    const title = screen.getByPlaceholderText(
      "Untitled",
    ) as HTMLTextAreaElement;
    fireEvent.change(title, { target: { value: "New title" } });
    expect(scheduleAutoSave).toHaveBeenCalledWith("New title", "", "");
  });

  it("closes and calls deleteNote from the trash button", async () => {
    const onClose = vi.fn();
    const note: Note = makeNote({
      _id: "n1" as NoteId,
      title: "Hello",
      slug: "hello",
    });
    render(<NoteDrawer note={note} open onClose={onClose} />);
    await flush();
    fireEvent.click(screen.getByLabelText("Delete note"));
    await flush();
    expect(deleteNote).toHaveBeenCalledWith("n1");
    expect(onClose).toHaveBeenCalled();
  });
});
