import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Zentrox | The Collaborative Whiteboard for Teams",
  },
  description:
    "Zentrox is a real-time collaborative whiteboard for teams. Brainstorm, sketch, and bring ideas to life together.",
};

import Hero from "@/components/landing/hero";
import { LazyHeroMockupSection, LazyFeaturesSection } from "@/components/landing/lazy-sections";

export default async function HomePage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <>
      <Hero isLoggedIn={isLoggedIn} />
      <LazyHeroMockupSection />
      <LazyFeaturesSection />
    </>
  );
}
