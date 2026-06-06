import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super("NOT_FOUND", `${entity} not found`);
  }
}
