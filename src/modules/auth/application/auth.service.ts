import { toAppError } from "@/core/errors";
import type {
  AuthMutations,
  AuthRepositoryPort,
} from "../domain/repositories/auth.repository";

function wrapErrors(mutations: AuthMutations): AuthMutations {
  return {
    signIn: async (payload) => {
      try {
        return await mutations.signIn(payload);
      } catch (err) {
        throw toAppError(err);
      }
    },
    signUp: async (payload) => {
      try {
        return await mutations.signUp(payload);
      } catch (err) {
        throw toAppError(err);
      }
    },
    signOut: async () => {
      try {
        return await mutations.signOut();
      } catch (err) {
        throw toAppError(err);
      }
    },
    updateProfile: async (name) => {
      try {
        return await mutations.updateProfile(name);
      } catch (err) {
        throw toAppError(err);
      }
    },
    deleteAccount: async () => {
      try {
        return await mutations.deleteAccount();
      } catch (err) {
        throw toAppError(err);
      }
    },
  };
}

export function createAuthService(repo: AuthRepositoryPort) {
  return {
    useSession: repo.useSession,
    useCurrentUser: repo.useCurrentUser,
    useActions: () => wrapErrors(repo.useMutations()),
  };
}
