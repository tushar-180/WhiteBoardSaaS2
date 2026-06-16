import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Features | Zentrox",
  description:
    "Explore the powerful features of Zentrox, the collaborative whiteboard for modern teams.",
};

export default async function FeaturesPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-12 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Powerful Features for Modern Teams
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to brainstorm, plan, and collaborate in
            real-time.
          </p>
        </div>
        <Features />
      </main>
      <Footer />
    </div>
  );
}
