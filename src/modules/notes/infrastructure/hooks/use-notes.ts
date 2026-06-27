"use client";

import { createNotesService } from "../../application/notes.service";
import { convexNoteRepository } from "../repositories/convex-note.repository";

const notesService = createNotesService(convexNoteRepository);

export const useAllNotes = notesService.useAllNotes;
export const useActiveNotes = notesService.useActiveNotes;
export const useFavoriteNotes = notesService.useFavoriteNotes;
export const useArchivedNotes = notesService.useArchivedNotes;
export const useNotesSearch = notesService.useNotesSearch;
export const useNoteCounts = notesService.useNoteCounts;
