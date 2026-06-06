import { AppError } from "./app-error";

export class NotAuthenticatedError extends AppError {
  constructor(message = "Not authenticated") {
    super("NOT_AUTHENTICATED", message);
  }
}
