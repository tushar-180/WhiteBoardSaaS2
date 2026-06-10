import { Users, Layers, LayoutGrid, Download } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            SaaS whiteboard, simplified.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg sm:text-xl">
            Designed for software developers, product managers, and architects who need to visual-map ideas without friction.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Spans 2 columns - Multiplayer */}
          <div className="md:col-span-2 relative group rounded-2xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 -z-10 h-40 w-40 rounded-full bg-blue-500/5 blur-[50px]" />
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-6">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Multiplayer Collaboration</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Work side-by-side with teammates. Watch their cursors move in real-time as they sketch flows, map out architectures, or write user stories.
              </p>
            </div>
            {/* Visual element at bottom of card */}
            <div className="mt-6 flex items-center gap-2 border border-border/60 bg-muted/30 rounded-lg p-3 text-xs w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground font-semibold">Active:</span>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-indigo-500 text-[8px] flex items-center justify-center text-white font-bold">AL</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-emerald-500 text-[8px] flex items-center justify-center text-white font-bold">SH</div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-card bg-purple-500 text-[8px] flex items-center justify-center text-white font-bold">JD</div>
              </div>
            </div>
          </div>

          {/* Card 2: Spans 1 column - Infinite Canvas */}
          <div className="relative group rounded-2xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 -z-10 h-40 w-40 rounded-full bg-purple-500/5 blur-[50px]" />
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 mb-6">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Infinite Canvas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pan, zoom, and expand infinitely. Our high-fidelity vector engine ensures your drawings stay sharp no matter the zoom level.
              </p>
            </div>
            <div className="mt-6 border border-border/60 bg-muted/30 rounded-lg py-1.5 px-3 text-[10px] font-bold text-muted-foreground w-fit">
              Zoom: 250%
            </div>
          </div>

          {/* Card 3: Spans 1 column - Export */}
          <div className="relative group rounded-2xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 -z-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-[50px]" />
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-6">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">High-Quality Exports</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Export your drawings to PNG, SVG, or JSON. Embed them in Notion, GitHub Pull Requests, or system design documentation.
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <span className="rounded bg-accent/50 px-2 py-1 text-[9px] font-bold text-muted-foreground">PNG</span>
              <span className="rounded bg-accent/50 px-2 py-1 text-[9px] font-bold text-muted-foreground">SVG</span>
              <span className="rounded bg-accent/50 px-2 py-1 text-[9px] font-bold text-muted-foreground">JSON</span>
            </div>
          </div>

          {/* Card 4: Spans 2 columns - Organized Workspaces */}
          <div className="md:col-span-2 relative group rounded-2xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 -z-10 h-40 w-40 rounded-full bg-amber-500/5 blur-[50px]" />
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mb-6">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Organized Workspaces</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Keep your whiteboard boards structured. Group related boards inside distinct workspaces for separate client projects, sprints, or design domains.
              </p>
            </div>
            {/* Visual list in card */}
            <div className="mt-6 space-y-1.5 border border-border/60 bg-muted/10 rounded-xl p-3 w-full max-w-sm">
              <div className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
                <span className="text-foreground font-semibold">🖥️ System Architecture Diagram</span>
                <span className="text-muted-foreground">2 hrs ago</span>
              </div>
              <div className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
                <span className="text-foreground font-semibold">📝 User Story Mapping</span>
                <span className="text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
                <span className="text-foreground font-semibold">🎨 Landing Page Wireframes</span>
                <span className="text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
