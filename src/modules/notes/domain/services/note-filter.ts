import type { Note } from "../entities/note";
import { isActive, isArchived, isDeleted, isFavorite } from "./note-status";

export type SortOrder = "asc" | "desc";

export type NoteStatusFilter = "all" | "active" | "favorite" | "archived";

export type FilterCriteria = {
  status?: NoteStatusFilter;
  search?: string;
  sortOrder?: SortOrder;
};

function getTime(note: Note): number {
  return note.updatedAt ?? note._creationTime;
}

function matchesStatus(note: Note, status: NoteStatusFilter): boolean {
  if (isDeleted(note)) return false;
  switch (status) {
    case "active":
      return isActive(note);
    case "favorite":
      return isFavorite(note);
    case "archived":
      return isArchived(note);
    case "all":
    default:
      return true;
  }
}

function matchesSearch(note: Note, search: string): boolean {
  if (!search) return true;
  return note.title.toLowerCase().includes(search.toLowerCase());
}

export function filterAndSort(
  notes: Note[],
  criteria: FilterCriteria = {},
): Note[] {
  const { status = "all", search = "", sortOrder = "desc" } = criteria;

  const filtered = notes.filter(
    (note) => matchesStatus(note, status) && matchesSearch(note, search),
  );

  return filtered.sort((a, b) => {
    const aPinned = a.isPinned === true;
    const bPinned = b.isPinned === true;
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    const aTime = getTime(a);
    const bTime = getTime(b);
    return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
  });
}

export function countByStatus(notes: Note[]) {
  const live = notes.filter((n) => !isDeleted(n));
  return {
    total: live.length,
    active: live.filter(isActive).length,
    favorite: live.filter(isFavorite).length,
    archived: live.filter(isArchived).length,
  };
}
