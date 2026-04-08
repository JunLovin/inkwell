"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return children;
}
