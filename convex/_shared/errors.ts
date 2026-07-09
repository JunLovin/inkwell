import { ConvexError } from "convex/values";

export const errors = {
  notAuthenticated: () =>
    new ConvexError({
      code: "NOT_AUTHENTICATED",
      message: "Not authenticated",
    }),
  notAuthorized: () =>
    new ConvexError({ code: "NOT_AUTHORIZED", message: "Not authorized" }),
  notFound: (entity: string) =>
    new ConvexError({ code: "NOT_FOUND", message: `${entity} not found` }),
  invalidInput: (message: string) =>
    new ConvexError({ code: "INVALID_INPUT", message }),
  aiNotConfigured: () =>
    new ConvexError({
      code: "AI_NOT_CONFIGURED",
      message: "AI is not configured",
    }),
  aiUnavailable: () =>
    new ConvexError({
      code: "AI_UNAVAILABLE",
      message: "AI service is temporarily unavailable",
    }),
};
