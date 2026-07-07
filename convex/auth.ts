import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params, _ctx) {
        return {
          name: params.name as string,
          email: params.email as string,
        };
      },
    }),
  ],
});
