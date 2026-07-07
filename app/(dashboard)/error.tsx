"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/ui";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <AlertTriangle size={22} className="text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-white text-xl font-light tracking-tight">
            This page hit a snag
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Something in your workspace couldn&apos;t load. Try again, or go
            back to the dashboard.
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
          <Link href="/dashboard" className="inline-flex">
            <Button
              variant="secondary"
              size="md"
              icon={<LayoutDashboard size={14} />}
            >
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
