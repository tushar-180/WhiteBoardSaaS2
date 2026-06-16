import {
  Users,
  Layers,
  LayoutGrid,
  Download,
  Plus,
  Search,
  ChevronRight,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 lg:py-32 bg-background relative overflow-hidden"
    >
      {/* Subtle top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            SaaS whiteboard, simplified.
          </h2>
          <p className="mt-6 text-white/50 text-lg sm:text-xl font-light tracking-wide max-w-2xl mx-auto">
            Designed for software developers, product managers, and architects
            who need to visual-map ideas without friction.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Spans 2 columns - Multiplayer */}
          <div className="md:col-span-2 relative group rounded-3xl border border-white/10 bg-[#09090b] p-8 shadow-2xl flex flex-col justify-between min-h-[320px] transition-all hover:bg-[#0c0c0e]">
            <GlowingEffect blur={0} borderWidth={3} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-6 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Multiplayer Collaboration
              </h3>
              <p className="text-white/50 text-sm max-w-md leading-relaxed font-light">
                Work side-by-side with teammates. Watch their cursors move in
                real-time as they sketch flows, map out architectures, or write
                user stories.
              </p>
            </div>

            {/* Visual element: Sleek Active Users Widget */}
            <div className="mt-8 flex items-center gap-3 border border-white/10 bg-white/5 rounded-2xl p-2.5 w-fit relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 pl-2 pr-4 border-r border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">
                  Live
                </span>
              </div>
              <div className="flex -space-x-2 px-2">
                <div className="h-7 w-7 rounded-full border-2 border-[#121214] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-30">
                  AL
                </div>
                <div className="h-7 w-7 rounded-full border-2 border-[#121214] bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-20">
                  SH
                </div>
                <div className="h-7 w-7 rounded-full border-2 border-[#121214] bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm z-10">
                  JD
                </div>
              </div>
              <div className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors shadow-sm ml-1">
                <Plus className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Card 2: Spans 1 column - Infinite Canvas */}
          <div className="relative group rounded-3xl border border-white/10 bg-[#09090b] p-8 shadow-2xl flex flex-col justify-between min-h-[320px] transition-all hover:bg-[#0c0c0e]">
            <GlowingEffect blur={0} borderWidth={3} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-6 shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Infinite Canvas
              </h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">
                Pan, zoom, and expand infinitely. Our high-fidelity vector
                engine ensures your drawings stay sharp no matter the zoom
                level.
              </p>
            </div>

            {/* Visual element: Sleek Minimap */}
            <div className="mt-8 relative z-10 w-full h-24 rounded-xl border border-white/10 bg-[#121214] overflow-hidden p-2">
              <div className="w-full h-full border border-white/5 bg-[#09090b] rounded-lg relative">
                {/* Viewport Box */}
                <div className="absolute top-2 left-2 w-12 h-8 border border-indigo-500/50 bg-indigo-500/10 rounded-[2px]" />
                {/* Abstract content blocks */}
                <div className="absolute top-3 left-16 w-8 h-4 bg-white/10 rounded-[1px]" />
                <div className="absolute top-10 left-6 w-14 h-6 bg-white/5 rounded-[1px]" />
                <div className="absolute top-8 left-24 w-6 h-6 bg-white/10 rounded-[1px]" />
              </div>
              <div className="absolute bottom-3 right-3 text-[9px] font-bold text-white/70 bg-[#121214] px-1.5 py-0.5 rounded">
                250%
              </div>
            </div>
          </div>

          {/* Card 3: Spans 1 column - Export */}
          <div className="relative group rounded-3xl border border-white/10 bg-[#09090b] p-8 shadow-2xl flex flex-col justify-between min-h-[320px] transition-all hover:bg-[#0c0c0e]">
            <GlowingEffect blur={0} borderWidth={3} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-6 shadow-sm">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                High-Quality Exports
              </h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">
                Export your drawings to PNG, SVG, or JSON. Embed them in Notion,
                GitHub Pull Requests, or system design documentation.
              </p>
            </div>

            {/* Visual element: Export Format Selector */}
            <div className="mt-8 relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded border border-emerald-500/20 bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Download className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-100">
                    Export as SVG
                  </span>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded border border-white/10 bg-white/5 flex items-center justify-center text-white/50">
                    <Download className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-white/60">
                    Export as PNG
                  </span>
                </div>
                <div className="h-4 w-4 rounded-full border border-white/20" />
              </div>
            </div>
          </div>

          {/* Card 4: Spans 2 columns - Organized Workspaces */}
          <div className="md:col-span-2 relative group rounded-3xl border border-white/10 bg-[#09090b] p-8 shadow-2xl flex flex-col justify-between min-h-[320px] transition-all hover:bg-[#0c0c0e]">
            <GlowingEffect blur={0} borderWidth={3} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between h-full">
              <div className="max-w-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-6 shadow-sm">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Organized Workspaces
                </h3>
                <p className="text-white/50 text-sm leading-relaxed font-light mb-6">
                  Keep your boards structured. Group related boards inside
                  distinct workspaces for separate client projects, sprints, or
                  design domains.
                </p>
              </div>

              {/* Visual element: Sleek Sidebar Mock */}
              <div className="w-full sm:w-[280px] md:w-64 shrink-0 rounded-2xl border border-white/10 bg-[#121214] overflow-hidden flex flex-col min-h-[180px] md:h-full mx-auto md:mx-0 mt-2 md:mt-0 shadow-lg">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 shrink-0 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                      Z
                    </div>
                    <span className="text-xs font-semibold text-white/90 truncate">
                      Zentrox HQ
                    </span>
                  </div>
                  <Search className="h-3.5 w-3.5 text-white/40 shrink-0" />
                </div>
                <div className="p-2 space-y-0.5 flex-1">
                  <div className="px-2 py-1.5 flex items-center gap-2 rounded-lg bg-white/10 cursor-pointer">
                    <span className="text-[10px] shrink-0">🎨</span>
                    <span className="text-xs font-medium text-white truncate">
                      Design System
                    </span>
                  </div>
                  <div className="px-2 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/5 cursor-pointer group/item transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] opacity-70 shrink-0">🖥️</span>
                      <span className="text-xs font-medium text-white/60 group-hover/item:text-white/90 truncate">
                        Architecture
                      </span>
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-white/20 group-hover/item:text-white/50" />
                  </div>
                  <div className="px-2 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/5 cursor-pointer group/item transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] opacity-70 shrink-0">📝</span>
                      <span className="text-xs font-medium text-white/60 group-hover/item:text-white/90 truncate">
                        Q3 Planning
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
