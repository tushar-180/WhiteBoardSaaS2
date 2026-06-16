import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export const metadata: Metadata = {
  title: "Pricing | Zentrox",
  description:
    "Simple, transparent pricing for teams of all sizes. Start for free.",
};

export default async function PricingPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Simple, <PointerHighlight containerClassName="inline-block"><span className="text-indigo-400">Transparent</span></PointerHighlight> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="border border-border/60 bg-card rounded-2xl p-8 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">
                Perfect for individuals and small projects.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Up to 3
                  whiteboards
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Basic shapes
                  and tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> 7-day version
                  history
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href={ROUTES.LOGIN}>Get Started</Link>
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="border border-indigo-500/30 bg-card relative rounded-2xl p-8 shadow-md flex flex-col ring-1 ring-indigo-500/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">
                For teams that need more power and security.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$12</span>
                <span className="text-muted-foreground">/user/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Unlimited
                  whiteboards
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Advanced export
                  options
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Unlimited
                  version history
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Custom
                  templates
                </li>
              </ul>
              <Button
                asChild
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Link href={ROUTES.LOGIN}>Upgrade to Pro</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
