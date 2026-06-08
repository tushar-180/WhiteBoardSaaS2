import { ArrowLeft, RefreshCw } from "lucide-react";

export default function BoardLoading() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative select-none">
      {/* Top Header Mockup */}
      <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 text-muted-foreground/40">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-2 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
      </header>

      {/* Drawing Canvas Area Placeholder */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background/50 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-purple-500/20 text-primary mb-4 shadow-sm animate-pulse">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Initializing canvas workspace...
        </p>
      </main>
    </div>
  );
}
