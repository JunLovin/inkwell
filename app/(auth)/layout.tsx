import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex h-dvh bg-[url('/landing/background.png')] font-host bg-blend-overlay bg-black/80">
        <div className="h-full flex-2 bg-[url('/landing/hero_background.png')] md:flex flex-col items-start p-8 justify-end relative bg-cover bg-center z-10 bg-blend-overlay hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 z-0" />
          <Link
            href="/"
            className="absolute top-8 flex items-center justify-center gap-2 left-6 text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Landing
          </Link>
          <h1 className="text-left z-10 text-5xl tracking-tighter">
            The power of AI and your notes, <br />
            all in one app.
          </h1>
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </>
  );
}
