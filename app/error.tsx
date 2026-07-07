"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/shared/ui";

export default function GlobalRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <AlertTriangle size={22} className="text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-light tracking-tight">
            Something went wrong
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            An unexpected error occurred. Try again, or head back home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={reset}
            icon={<RotateCw size={14} />}
          >
            Try again
          </Button>
          <Link href="/" className="inline-flex">
            <Button variant="secondary" size="md" icon={<Home size={14} />}>
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
