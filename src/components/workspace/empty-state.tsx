"use client";

import { FolderPlus, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-card/40 border border-border/60 rounded-2xl shadow-sm backdrop-blur-xs relative overflow-hidden transition-all duration-300 max-w-lg mx-auto">
      {/* Background decoration grid/dots pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-xs">
        <Layout className="h-8 w-8" />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-background border border-border/50 text-muted-foreground shadow-xs">
          <FolderPlus className="h-3 w-3" />
        </span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        No Workspaces Found
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        Create your first workspace to start organizing your design boards and collaborating in real-time.
      </p>

      <Button
        onClick={onCreateClick}
        size="lg"
        className="rounded-xl font-semibold shadow-md active:scale-[0.99] transition-all duration-200"
      >
        <FolderPlus className="mr-2 h-4 w-4" />
        Create Workspace
      </Button>
    </div>
  );
}
