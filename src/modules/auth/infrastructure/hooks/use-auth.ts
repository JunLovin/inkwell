"use client";

import { authService } from "../auth-service";

export const useAuthSession = authService.useSession;
export const useAuthActions = authService.useActions;
