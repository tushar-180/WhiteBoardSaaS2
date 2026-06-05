import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { boardId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch board details
  const board = await fetchBoardById(boardId);
  if (!board) {
    notFound();
  }

  // 2. Validate workspace access
  const hasAccess = await hasWorkspaceAccess(board.workspace_id, user.id);
  if (!hasAccess) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/workspaces/${board.workspace_id}`}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Back to Workspace"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate">
                {board.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {board.description || "No description"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-bold">
              Stage 4 Mode
            </span>
          </div>
        </div>
      </header>

      {/* Canvas Area Container */}
      <main className="flex-1 flex flex-col p-6 items-center justify-center relative">
        {/* Modern dot grid pattern representing canvas */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Premium placeholder card */}
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card/60 border border-border/80 rounded-2xl shadow-lg backdrop-blur-md max-w-xl mx-auto w-full border-t-primary/30">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-purple-500/20 text-primary mb-8 shadow-xs animate-bounce duration-[3000ms]">
            <LayoutGrid className="h-10 w-10 text-primary" />
            <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary border border-background text-[10px] font-black text-primary-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-foreground mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Whiteboard Canvas Ready
          </h2>
          
          <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
            The database board <span className="font-semibold text-foreground">&quot;{board.name}&quot;</span> is active. 
            In the next phase (Stage 5), we will embed the interactive drawing board components here and persist your sketches in the database.
          </p>

          <div className="flex items-center gap-3">
            <Link href={`/workspaces/${board.workspace_id}`}>
              <Button variant="outline" className="rounded-xl h-10 px-5 font-semibold">
                Back to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

