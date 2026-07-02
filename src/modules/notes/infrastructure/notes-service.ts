"use client";

import { createNotesService } from "../application/notes.service";
import { convexNoteRepository } from "./repositories/convex-note.repository";

export const notesService = createNotesService(convexNoteRepository);
