"use client";

import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import type {
  AuthRepositoryPort,
  AuthMutations,
} from "../../domain/repositories/auth.repository";

export const convexAuthRepository: AuthRepositoryPort = {
  useSession: () => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    return { isAuthenticated, isLoading };
  },

  useCurrentUser: () => {
    const user = useQuery(api.users.getUserInfo);
    return { user: user ?? undefined, isLoading: user === undefined };
  },

  useMutations: (): AuthMutations => {
    const { signIn, signOut } = useAuthActions();
    const updateProfileMutation = useMutation(api.users.updateProfile);
    const deleteAccountMutation = useMutation(api.users.deleteAccount);

    return {
      signIn: async ({ email, password }) => {
        await signIn("password", { email, password, flow: "signIn" });
      },
      signUp: async ({ email, password, name }) => {
        await signIn("password", { email, name, password, flow: "signUp" });
      },
      signOut: async () => {
        await signOut();
      },
      updateProfile: async (name) => {
        await updateProfileMutation({ name });
      },
      deleteAccount: async () => {
        await deleteAccountMutation({});
      },
    };
  },
};
