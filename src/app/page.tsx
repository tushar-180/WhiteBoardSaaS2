import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Zentrox | The Collaborative Whiteboard for Teams",
  },
  description:
    "Zentrox is a real-time collaborative whiteboard for teams. Brainstorm, sketch, and bring ideas to life together.",
};

import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Footer from "@/components/landing/footer";
import { LazyHeroMockupSection, LazyFeaturesSection } from "@/components/landing/lazy-sections";

export default async function HomePage() {
  const { user } = await getCurrentUser();

  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero isLoggedIn={isLoggedIn} />
        <LazyHeroMockupSection />
        <LazyFeaturesSection />
      </main>
      <Footer />
    </div>
  );
}