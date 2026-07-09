import { Hero } from "@/shared/layout/landing/hero";
import { FeaturesGrid } from "@/shared/layout/landing/features-grid";
import { Faq } from "@/shared/layout/landing/faq";
import { Footer } from "@/shared/layout/landing/footer";

export default function LandingPage() {
  return (
    <main className="font-host bg-zinc-950">
      <Hero />
      <FeaturesGrid />
      <Faq />
      <Footer />
    </main>
  );
}
