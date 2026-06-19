import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { WavyBackground } from "@/components/ui/wavy-background";

interface HeroProps {
  isLoggedIn: boolean;
}

export default function Hero({ isLoggedIn }: HeroProps) {
  return (
    <WavyBackground 
      containerClassName="relative overflow-hidden min-h-screen flex items-center"
      className="max-w-4xl mx-auto pt-24 pb-32"
      backgroundFill="var(--background)"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Sleek Announcement Pill */}
        <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-border/50 bg-muted/50 px-3 py-1 backdrop-blur-md transition-all hover:bg-accent cursor-pointer group">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-xs font-medium text-foreground/80">
            Introducing Zentrox 1.0
          </p>
          <span className="text-muted-foreground/50 text-xs">|</span>
          <Link
            href="#features"
            className="flex items-center text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground"
          >
            See what&apos;s new
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 sm:text-6xl max-w-4xl mx-auto leading-[1.2] pb-2">
          The visual workspace for
          <br />
          <PointerHighlight containerClassName="inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
              limitless innovation
            </span>
          </PointerHighlight>
        </h1>

        {/* Minimalist description */}
        <p className="mt-6 text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
          The infinite multiplayer canvas built for visual thinkers. Sketch
          system architectures, brainstorm layouts, and align your team in
          real-time.
        </p>

        {/* Actions with inset shadows and subtle glow */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-sm font-medium w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-10px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all"
          >
            <Link href={ROUTES.WORKSPACES}>
              {isLoggedIn ? "Open Workspaces" : "Start Drawing Now"}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 text-sm font-medium w-full sm:w-auto rounded-full border-border bg-muted/50 text-foreground hover:bg-accent backdrop-blur-md transition-all"
          >
            <Link href="#features">Learn how it works</Link>
          </Button>
        </div>
      </div>
    </WavyBackground>
  );
}
