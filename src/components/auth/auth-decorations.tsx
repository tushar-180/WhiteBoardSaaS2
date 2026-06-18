"use client";

import { MousePointer, Sparkles } from "lucide-react";

export function AuthDecorations() {
  return (
    <>
      {/* Canvas Grid Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(oklch(var(--muted-foreground)/0.12)_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
      
      {/* Decorative Glow Highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-72 w-72 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Decorative Floating Multiplayer Cursors (Desktop only) */}
      <div className="hidden lg:flex absolute top-[20%] left-[15%] items-center gap-1.5 animate-bounce" style={{ animationDuration: '6s' }}>
        <MousePointer className="h-5 w-5 text-indigo-500 fill-indigo-500 transform -rotate-90 filter drop-shadow-xs" />
        <div className="rounded-lg bg-indigo-700 px-2 py-1 text-[10px] font-bold text-white shadow-md border border-indigo-400/20 whitespace-nowrap select-none">
          Emma is sketching...
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-[22%] right-[15%] items-center gap-1.5 animate-bounce" style={{ animationDuration: '8s' }}>
        <MousePointer className="h-5 w-5 text-emerald-500 fill-emerald-500 transform -rotate-90 filter drop-shadow-xs" />
        <div className="rounded-lg bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white shadow-md border border-emerald-400/20 whitespace-nowrap select-none">
          Lucas connected
        </div>
      </div>

      {/* Hand-drawn Mock Sticky Note (Desktop only) */}
      <div className="hidden lg:flex absolute bottom-[18%] left-[10%] rotate-[-3deg] rounded-xl bg-yellow-100/90 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-900/40 p-5 shadow-lg w-52 h-52 flex-col justify-between backdrop-blur-xs transition-all hover:scale-102 hover:rotate-[-1deg] duration-300 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">Demo Access</span>
          </div>
          <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
        </div>
        <p className="text-[12px] text-yellow-950 dark:text-yellow-100 font-semibold leading-relaxed font-sans">
          You can use any test email & password to sign up. Zentrox runs in sandbox mode for developers.
        </p>
        <span className="text-[9px] text-yellow-700 dark:text-yellow-300 font-bold self-end">#sandbox-ready</span>
      </div>

      {/* Sketchy connecting arrow from Sticky Note to Form (Desktop only) */}
      <svg className="hidden lg:block absolute left-[20%] bottom-[32%] h-24 w-32 pointer-events-none text-muted-foreground/25" viewBox="0 0 100 100" fill="none">
        <path d="M 10 90 Q 60 70 85 20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
        <path d="M 72 23 L 85 20 L 80 33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  );
}
