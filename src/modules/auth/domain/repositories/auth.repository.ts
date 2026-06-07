import type { User } from "../entities/user";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  name: string;
};

export type ResetVerifyPayload = {
  email: string;
  code: string;
  newPassword: string;
};

export type AuthSession = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthMutations = {
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (payload: ResetVerifyPayload) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export type AuthRepositoryPort = {
  useSession: () => AuthSession;
  useCurrentUser: () => { user: User | undefined; isLoading: boolean };
  useMutations: () => AuthMutations;
};
