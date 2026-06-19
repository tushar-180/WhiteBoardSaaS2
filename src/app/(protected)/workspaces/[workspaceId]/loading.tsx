import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceDetailLoading() {
  return (
    <main className="flex-1 container mx-auto px-6 py-10 max-w-7xl">
      {/* Back navigation skeleton */}
      <div className="inline-flex items-center gap-1.5 text-xs mb-6 font-semibold text-muted-foreground transition-all">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Workspaces</span>
      </div>

      {/* Workspace Title & Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left / Center - Boards Content (Col Span 3) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              {/* Title Skeleton */}
              <Skeleton className="h-8 w-48 mb-2 sm:h-9" />
              {/* Slug Skeleton */}
              <Skeleton className="h-4 w-32" />
            </div>

            {/* New Board Button Skeleton */}
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>

          <div className="border-t border-border/40 pt-6">
            {/* Board Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Skeleton Board Card 1 */}
              <div className="border border-border/60 bg-card/60 rounded-xl p-4 sm:p-5 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-[10px] w-12" />
                  </div>
                  <Skeleton className="h-5 w-2/3 mb-1.5 mt-1" />
                  <Skeleton className="h-3 w-5/6 mb-1 mt-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="border-t border-border/40 pt-4 flex justify-between items-center mt-5 relative z-10">
                  <Skeleton className="h-[11px] w-28" />
                  <Skeleton className="h-[11px] w-14" />
                </div>
              </div>

              {/* Skeleton Board Card 2 */}
              <div className="border border-border/60 bg-card/60 rounded-xl p-4 sm:p-5 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-[10px] w-12" />
                  </div>
                  <Skeleton className="h-5 w-1/2 mb-1.5 mt-1" />
                  <Skeleton className="h-3 w-3/4 mb-1 mt-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="border-t border-border/40 pt-4 flex justify-between items-center mt-5 relative z-10">
                  <Skeleton className="h-[11px] w-24" />
                  <Skeleton className="h-[11px] w-14" />
                </div>
              </div>

              {/* Skeleton Board Card 3 */}
              <div className="border border-border/60 bg-card/60 rounded-xl p-4 sm:p-5 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-[10px] w-12" />
                  </div>
                  <Skeleton className="h-5 w-3/5 mb-1.5 mt-1" />
                  <Skeleton className="h-3 w-2/3 mb-1 mt-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="border-t border-border/40 pt-4 flex justify-between items-center mt-5 relative z-10">
                  <Skeleton className="h-[11px] w-32" />
                  <Skeleton className="h-[11px] w-14" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Sidebar Metadata (Col Span 1) */}
        <div className="space-y-6 lg:border-l lg:border-border/40 lg:pl-8">
          {/* Workspace Info Card Skeleton */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>

          {/* Members Card Skeleton */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
