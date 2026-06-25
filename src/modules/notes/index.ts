export type { Note, NoteId } from "./domain/entities/note";
export type {
  SortOrder,
  NoteStatusFilter,
  FilterCriteria,
} from "./domain/services/note-filter";

export {
  useAllNotes,
  useActiveNotes,
  useFavoriteNotes,
  useArchivedNotes,
  useNoteCounts,
} from "./infrastructure/hooks/use-notes";
export { useNote } from "./infrastructure/hooks/use-note";
export { useNoteActions } from "./infrastructure/hooks/use-note-actions";

export { NoteCard } from "./ui/components/note-card";
export { NoteEditor, type SaveStatus } from "./ui/components/note-editor";
export { NoteDrawer } from "./ui/components/note-drawer";
export { NotesGrid } from "./ui/components/notes-grid";

export { DashboardHomePage } from "./ui/pages/dashboard-home-page";
export { NotesListPage } from "./ui/pages/notes-list-page";
export { NoteDetailPage } from "./ui/pages/note-detail-page";
export { FavoriteNotesPage } from "./ui/pages/favorite-notes-page";
export { ArchivedNotesPage } from "./ui/pages/archived-notes-page";
