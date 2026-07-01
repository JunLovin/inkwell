import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { EmailConfig } from "@auth/core/providers";

const ConsoleOTP: EmailConfig = {
  id: "console-otp",
  type: "email",
  name: "Console OTP",
  from: "Inkwell <noreply@inkwell.app>",
  maxAge: 60 * 15,
  async generateVerificationToken() {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  },
  async sendVerificationRequest({ identifier, token }) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Password reset transport is not configured. Wire an email provider before enabling password reset in production.",
      );
    }
    console.warn(
      `[auth] password reset requested for ${identifier} — code: ${token}`,
    );
  },
  options: {},
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: ConsoleOTP,
      profile(params, _ctx) {
        return {
          name: params.name as string,
          email: params.email as string,
        };
      },
    }),
  ],
});
