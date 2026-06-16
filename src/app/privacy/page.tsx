import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export const metadata: Metadata = {
  title: "Privacy Policy | Zentrox",
  description: "Privacy Policy for Zentrox.",
};

export default async function PrivacyPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
            <PointerHighlight containerClassName="inline-block">Privacy</PointerHighlight> Policy
          </h1>
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              Your privacy is important to us. It is Zentrox&apos;s policy to respect
              your privacy regarding any information we may collect from you
              across our website, and other sites we own and operate.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              Information we collect
            </h2>
            <p>
              We only ask for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              How we use your information
            </h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>
                Develop new products, services, features, and functionality
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
