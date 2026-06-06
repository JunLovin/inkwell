import type { Note } from "../entities/note";

export const isDeleted = (note: Note): boolean => note.isDeleted === true;
export const isArchived = (note: Note): boolean => note.isArchived === true;
export const isFavorite = (note: Note): boolean => note.isFavorite === true;
export const isActive = (note: Note): boolean =>
  !isDeleted(note) && !isArchived(note) && !isFavorite(note);
