"use client";

import { createNotesService } from "../../application/notes.service";
import { convexNoteRepository } from "../repositories/convex-note.repository";

const notesService = createNotesService(convexNoteRepository);

export const useNote = notesService.useNote;
