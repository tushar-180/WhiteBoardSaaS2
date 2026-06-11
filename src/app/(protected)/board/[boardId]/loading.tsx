import { ArrowLeft, Loader2 } from "lucide-react";

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

      {/* Minimal Canvas Area Placeholder */}
      <main className="flex-1 w-full flex items-center justify-center bg-muted/10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </main>
    </div>
  );
}
