import { ConvexError } from "convex/values";
import { AppError } from "./app-error";
import { NotAuthenticatedError } from "./not-authenticated.error";
import { NotAuthorizedError } from "./not-authorized.error";
import { NotFoundError } from "./not-found.error";

type ConvexErrorPayload = {
  code?: string;
  message?: string;
};

function extractPayload(err: unknown): ConvexErrorPayload | null {
  if (err instanceof ConvexError) {
    const data = err.data;
    if (data && typeof data === "object") {
      return data as ConvexErrorPayload;
    }
  }
  return null;
}

export function mapConvexError(err: unknown): AppError | null {
  const payload = extractPayload(err);
  if (!payload || !payload.code) return null;

  switch (payload.code) {
    case "NOT_AUTHENTICATED":
      return new NotAuthenticatedError(payload.message);
    case "NOT_AUTHORIZED":
      return new NotAuthorizedError(payload.message);
    case "NOT_FOUND":
      return new AppError("NOT_FOUND", payload.message ?? "Not found");
    default:
      return new AppError(
        payload.code,
        payload.message ?? "Something went wrong",
      );
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const mapped = mapConvexError(err);
  if (mapped) return mapped;
  const message = err instanceof Error ? err.message : "Something went wrong";
  return new AppError("UNKNOWN", message);
}

export { NotFoundError };
