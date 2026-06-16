import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service | Zentrox",
  description: "Terms of Service for Zentrox.",
};

export default async function TermsPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
            Terms of Service
          </h1>
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              1. Terms
            </h2>
            <p>
              By accessing the website at Zentrox, you are agreeing to be bound
              by these terms of service, all applicable laws and regulations,
              and agree that you are responsible for compliance with any
              applicable local laws.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on Zentrox's website for
              personal, non-commercial transitory viewing only.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              3. Disclaimer
            </h2>
            <p>
              The materials on Zentrox's website are provided on an 'as is'
              basis. Zentrox makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
