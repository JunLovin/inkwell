export type { User } from "./domain/entities/user";

export {
  useAuthSession,
  useAuthActions,
} from "./infrastructure/hooks/use-auth";
export { useCurrentUser } from "./infrastructure/hooks/use-current-user";

export { AuthGuard } from "./ui/components/auth-guard";
export { AuthShell } from "./ui/layouts/AuthShell";
export { LoginPage } from "./ui/pages/login-page";
export { RegisterPage } from "./ui/pages/register-page";
