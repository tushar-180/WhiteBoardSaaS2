import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacesLoading() {
  return (
    <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
      <div className="flex flex-col gap-4 mb-8">
        {/* Back to Home link */}
        <div className="inline-flex items-center gap-1.5 text-xs mb-5 font-semibold text-muted-foreground transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            {/* Welcome message skeleton */}
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-2">
              <span>Welcome back,</span>
              <Skeleton className="h-7 w-24 sm:h-8" />
              <span>!</span>
            </div>
            
            {/* Workspaces Subtitle Skeleton */}
            <h2 className="text-base font-semibold text-muted-foreground">
              Workspaces
            </h2>
            
            {/* Description Paragraph Skeleton */}
            <Skeleton className="h-4 w-3/4 sm:w-1/2" />
          </div>

          {/* New Workspace Button Skeleton */}
          <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
        </div>
      </div>

      {/* Workspace Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Create Workspace Card skeleton (dashed card structure) */}
        <div className="h-full min-h-[160px] border border-dashed border-border/60 bg-background/30 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>

        {/* Skeleton Workspace Card 1 */}
        <div className="flex flex-col border border-border/60 bg-card rounded-xl p-4 sm:p-5 gap-0 min-h-[160px] overflow-hidden">
          <div className="flex items-center gap-2 mb-3 mt-2 sm:mt-0">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-[10px] w-16" />
            <Skeleton className="h-[10px] w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-2/3 mt-1" />
          <Skeleton className="h-3.5 w-1/3 mt-2" />
          <div className="mt-5 border-t border-border/40 pt-4 flex justify-between items-end flex-1">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Skeleton Workspace Card 2 */}
        <div className="flex flex-col border border-border/60 bg-card rounded-xl p-4 sm:p-5 gap-0 min-h-[160px] overflow-hidden">
          <div className="flex items-center gap-2 mb-3 mt-2 sm:mt-0">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-[10px] w-16" />
            <Skeleton className="h-[10px] w-14 rounded-full" />
          </div>
          <Skeleton className="h-5 w-1/2 mt-1" />
          <Skeleton className="h-3.5 w-1/4 mt-2" />
          <div className="mt-5 border-t border-border/40 pt-4 flex justify-between items-end flex-1">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
