import { AppError } from "@/core/errors";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password");
  }
}

export class SignUpFailedError extends AppError {
  constructor() {
    super("SIGN_UP_FAILED", "Failed to create account");
  }
}
