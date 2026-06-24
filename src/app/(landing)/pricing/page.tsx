import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import { PricingPageClient } from "@/components/billing/pricing-client";
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-24 pb-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Simple,{" "}
          <PointerHighlight containerClassName="inline-block">
            <span className="text-indigo-400">Transparent</span>
          </PointerHighlight>{" "}
          Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start for free, upgrade when you need more power.
        </p>
      </div>

      <PricingPageClient isLoggedIn={isLoggedIn} />
    </div>
  );
}
