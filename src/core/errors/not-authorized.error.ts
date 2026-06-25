import { AppError } from "./app-error";

export class NotAuthorizedError extends AppError {
  constructor(message = "Not authorized") {
    super("NOT_AUTHORIZED", message);
  }
}
