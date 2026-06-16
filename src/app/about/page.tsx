import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export const metadata: Metadata = {
  title: "About Us | Zentrox",
  description:
    "Learn more about Zentrox and our mission to revolutionize visual collaboration.",
};

export default async function AboutPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
            About <PointerHighlight containerClassName="inline-block"><span className="text-indigo-400">Zentrox</span></PointerHighlight>
          </h1>
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-6">
            <p className="text-lg">
              At Zentrox, we believe that the best ideas are born visually. Our
              mission is to build the ultimate collaborative canvas for modern,
              distributed teams.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              Our Story
            </h2>
            <p>
              Born out of the frustration with clunky diagramming tools and
              rigid whiteboards, Zentrox was designed from the ground up to be
              fast, fluid, and intuitive. We wanted a tool that felt like a
              natural extension of your mind.
            </p>
            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">
              Our Values
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Speed over everything:</strong> A tool should never get
                in the way of your thoughts.
              </li>
              <li>
                <strong>Collaboration built-in:</strong> We believe work is
                fundamentally multiplayer.
              </li>
              <li>
                <strong>Privacy by design:</strong> Your data is yours. We
                secure it with industry-leading encryption.
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
