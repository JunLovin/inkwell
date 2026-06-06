"use client";

import { createAuthService } from "../../application/auth.service";
import { convexAuthRepository } from "../repositories/convex-auth.repository";

const authService = createAuthService(convexAuthRepository);

export const useCurrentUser = authService.useCurrentUser;
