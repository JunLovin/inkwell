"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/shared/ui";
import { useAuthSession } from "../../infrastructure/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    const currentSearch =
      typeof window !== "undefined" ? window.location.search : "";
    const nextPath = `${pathname ?? "/"}${currentSearch}`;
    const target = nextPath.startsWith("/dashboard")
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";
    router.push(target);
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-zinc-500">Redirecting…</p>
      </div>
    );
  }

  return children;
}
