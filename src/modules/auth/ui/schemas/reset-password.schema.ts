import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    code: z
      .string()
      .min(1, "Enter the code we sent to your email")
      .length(6, "The code is 6 digits"),
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
