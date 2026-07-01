"use client";

import { notesService } from "../notes-service";

export const useAllNotes = notesService.useAllNotes;
export const useActiveNotes = notesService.useActiveNotes;
export const useFavoriteNotes = notesService.useFavoriteNotes;
export const useArchivedNotes = notesService.useArchivedNotes;
export const useDeletedNotes = notesService.useDeletedNotes;
export const useNotesSearch = notesService.useNotesSearch;
export const useNoteCounts = notesService.useNoteCounts;
