import { AppError } from "@/core/errors";

export class NoteNotFoundError extends AppError {
  constructor(slug?: string) {
    super(
      "NOTE_NOT_FOUND",
      slug ? `Note with slug "${slug}" not found` : "Note not found",
    );
  }
}
