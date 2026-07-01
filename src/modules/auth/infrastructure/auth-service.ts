"use client";

import { createAuthService } from "../application/auth.service";
import { convexAuthRepository } from "./repositories/convex-auth.repository";

export const authService = createAuthService(convexAuthRepository);
