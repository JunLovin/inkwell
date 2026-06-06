import type { AuthRepositoryPort } from "../domain/repositories/auth.repository";

export function createAuthService(repo: AuthRepositoryPort) {
  return {
    useSession: repo.useSession,
    useCurrentUser: repo.useCurrentUser,
    useActions: repo.useMutations,
  };
}
