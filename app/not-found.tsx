import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/shared/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <Compass size={22} className="text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-light tracking-tight">
            Page not found
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Link href="/" className="inline-flex">
          <Button variant="primary" size="md" icon={<Home size={14} />}>
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
