import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Sparkles, MousePointer, PenTool, Type, Square, Circle, Eraser, Download, HelpCircle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  isLoggedIn: boolean;
}

export default function Hero({ isLoggedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Premium Dot Grid Canvas Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary-foreground),transparent_60%)] opacity-30" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(oklch(var(--muted-foreground)/0.15)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />

      {/* Decorative Glow Highlights */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 h-[310px] w-[600px] rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-[120px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-purple-600" />
          <span className="text-muted-foreground">Introducing Zentrox 1.0</span>
          <span className="text-muted-foreground/40">|</span>
          <Link href="#features" className="flex items-center gap-0.5 hover:text-primary transition-colors">
            See what's new <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Catchy, Custom Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl max-w-4xl mx-auto leading-[1.08] font-sans">
          Draw. Think.<br />
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Collaborate.
            </span>
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-purple-500/40" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Minimalist description */}
        <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          The infinite multiplayer canvas built for visual thinkers. Sketch system architectures, brainstorm layouts, and align your team in real-time.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold w-full sm:w-auto shadow-md rounded-xl active:scale-98 transition-transform">
            <Link href="/workspaces">
              {isLoggedIn ? "Open Workspaces" : "Start Drawing Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold w-full sm:w-auto rounded-xl active:scale-98 transition-transform">
            <Link href="#features">
              Learn how it works
            </Link>
          </Button>
        </div>

        {/* Interactive Whiteboard Canvas Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border/80 bg-background/50 p-3 shadow-2xl backdrop-blur-sm group">
          {/* Main Canvas Area */}
          <div className="relative rounded-xl border border-border/50 bg-background/40 h-[400px] sm:h-[520px] w-full overflow-hidden select-none">
            {/* Fine Whiteboard Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(oklch(var(--muted-foreground)/0.12)_1.2px,transparent_1.2px)] [background-size:20px_20px] bg-background" />

            {/* Floating Top-Left Page Selection */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/95 px-3 py-1.5 shadow-sm text-xs font-semibold backdrop-blur-md">
              <span className="text-muted-foreground">Workspace:</span>
              <span className="text-foreground">Project Alpha</span>
            </div>

            {/* Floating Bottom-Left Zoom Widget */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-lg border border-border/60 bg-background/95 p-1 shadow-sm backdrop-blur-md">
              <Button size="icon-xs" variant="ghost" className="h-7 w-7 rounded-md">
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-[10px] font-bold px-2 text-muted-foreground">100%</span>
              <Button size="icon-xs" variant="ghost" className="h-7 w-7 rounded-md">
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Floating tldraw-style Center Tool Selection */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-md">
              <Button size="icon-sm" variant="ghost" className="rounded-lg bg-primary text-primary-foreground">
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-foreground">
                <PenTool className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-foreground">
                <Square className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-foreground">
                <Circle className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-foreground">
                <Type className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-foreground">
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            {/* Floating Top-Right Utilities */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button size="icon-sm" variant="outline" className="rounded-lg bg-background/95 shadow-sm">
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button size="icon-sm" variant="outline" className="rounded-lg bg-background/95 shadow-sm">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* SVGs representing sketchy, hand-drawn vector art */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              <g className="stroke-foreground/90" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Handdrawn styled Rectangle 1 */}
                <path d="M 120 180 L 260 180 Q 262 181 260 183 L 260 250 Q 259 252 258 250 L 120 250 Q 118 249 120 248 L 120 182" className="stroke-primary" />
                {/* Handdrawn double-strike effect */}
                <path d="M 122 179 L 258 181 L 259 248 L 121 249 L 122 181" className="stroke-primary/40" strokeWidth="1.5" />

                {/* Handdrawn Circle 1 */}
                <path d="M 440 215 C 440 180, 500 180, 500 215 C 500 250, 440 250, 440 215 Z" className="stroke-purple-500" />
                <path d="M 439 216 C 441 182, 498 178, 501 214 C 499 252, 438 248, 439 216 Z" className="stroke-purple-500/40" strokeWidth="1.5" />

                {/* Sketchy Arrow connecting them */}
                <path d="M 270 215 L 420 215" className="stroke-muted-foreground/60" strokeDasharray="3 3" />
                {/* Arrow Head */}
                <path d="M 410 208 L 420 215 L 410 222" className="stroke-muted-foreground/60" />
              </g>

              {/* Text inside shapes */}
              <text x="145" y="218" className="fill-foreground font-semibold text-xs tracking-wide">React Frontend</text>
              <text x="452" y="218" className="fill-foreground font-semibold text-xs tracking-wide">Next.js API</text>
            </svg>

            {/* Hand-drawn Mock Sticky Note */}
            <div className="absolute top-[35%] right-[10%] rotate-3 rounded-lg bg-yellow-100/90 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-900/40 p-4 shadow-xl w-40 h-40 flex flex-col justify-between backdrop-blur-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Note</span>
              </div>
              <p className="text-[12px] text-yellow-900 dark:text-yellow-100 font-medium leading-relaxed font-sans">
                Review the Supabase proxy.ts redirect loop checks. 💡
              </p>
              <span className="text-[9px] text-yellow-600/70 font-semibold self-end">#release-notes</span>
            </div>

            {/* Collaborative Cursor 1 */}
            <div className="absolute top-[52%] left-[28%] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '6s' }}>
              <MousePointer className="h-5 w-5 text-indigo-500 fill-indigo-500 transform -rotate-90 filter drop-shadow-sm" />
              <div className="rounded-lg bg-indigo-500 px-2 py-1 text-[10px] font-bold text-white shadow-md border border-indigo-400/20">
                Sarah (Drawing...)
              </div>
            </div>

            {/* Collaborative Cursor 2 */}
            <div className="absolute bottom-[35%] left-[54%] flex items-center gap-1.5">
              <MousePointer className="h-5 w-5 text-emerald-500 fill-emerald-500 transform -rotate-90 filter drop-shadow-sm" />
              <div className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-md border border-emerald-400/20">
                Alex (Typing...)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
