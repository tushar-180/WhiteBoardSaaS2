import {
  MousePointer,
  PenTool,
  Type,
  Square,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function HeroMockup() {
  return (
    <section className="relative bg-background pb-32 pt-10 overflow-hidden hidden md:block">
      <div className="flex flex-col relative z-10">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white mb-8">
                Unleash the power of <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Visual Collaboration
                </span>
              </h1>
            </>
          }
        >
          {/* Sleek macOS-style App Mockup */}
          <div className="relative rounded-xl border border-white/10 bg-[#09090b] h-full w-full overflow-hidden flex flex-col">
            {/* macOS Title Bar */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs font-medium text-white/40 tracking-wide px-4 py-1 rounded-md bg-white/5">
                Workspace / Project Alpha
              </div>
              <div className="flex gap-3">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full border border-[#09090b] bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white z-20">
                    AL
                  </div>
                  <div className="h-6 w-6 rounded-full border border-[#09090b] bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white z-10">
                    SH
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[#09090b]">
              {/* Fine Whiteboard Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Minimalist Floating Center Tool Selection */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl border border-white/10 bg-[#121214]/80 p-1.5 shadow-2xl backdrop-blur-xl">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-xl bg-indigo-500/20 text-indigo-400 h-9 w-9"
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-xl text-white/50 hover:text-white hover:bg-white/5 h-9 w-9"
                >
                  <PenTool className="h-4 w-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-xl text-white/50 hover:text-white hover:bg-white/5 h-9 w-9"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-xl text-white/50 hover:text-white hover:bg-white/5 hidden sm:inline-flex h-9 w-9"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>

              {/* Minimalist Zoom Widget */}
              <div className="hidden sm:flex absolute bottom-6 left-6 items-center gap-1 rounded-xl border border-white/10 bg-[#121214]/80 p-1 shadow-2xl backdrop-blur-xl">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-[11px] font-medium px-2 text-white/70">
                  100%
                </span>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Refined Vector Art / Diagram inside Mockup */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[500px] h-[300px]">
                  {/* Card 1 */}
                  <div className="absolute top-[20px] left-[50px] w-[140px] p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                    <div className="h-2 w-16 bg-white/20 rounded-full mb-2" />
                    <div className="h-1.5 w-24 bg-white/10 rounded-full mb-1" />
                    <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                  </div>

                  {/* Connection Line */}
                  <svg
                    className="absolute inset-0 w-full h-full text-white/20"
                    viewBox="0 0 500 300"
                  >
                    <path
                      d="M 190 60 C 260 60, 240 220, 310 220"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle cx="310" cy="220" r="4" fill="currentColor" />
                  </svg>

                  {/* Card 2 */}
                  <div className="absolute top-[180px] left-[310px] w-[160px] p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <div className="w-2 h-2 rounded-sm bg-indigo-400" />
                      </div>
                      <div className="h-2 w-16 bg-indigo-400/80 rounded-full" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full mb-1.5" />
                    <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                  </div>

                  {/* Collaborative Cursors */}
                  <div className="absolute top-[160px] left-[280px] flex items-center gap-1.5">
                    <MousePointer className="h-4 w-4 text-emerald-400 fill-emerald-400 transform -rotate-15 drop-shadow-md" />
                    <div className="rounded-md bg-emerald-400/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-emerald-950 shadow-sm">
                      Sarah
                    </div>
                  </div>

                  <div className="absolute top-[80px] left-[130px] flex items-center gap-1.5">
                    <MousePointer className="h-4 w-4 text-cyan-400 fill-cyan-400 transform -rotate-15 drop-shadow-md" />
                    <div className="rounded-md bg-cyan-400/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-cyan-950 shadow-sm">
                      Alex
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
}
