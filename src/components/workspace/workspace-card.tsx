"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, ArrowRight, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { type Workspace } from "@/types/workspace";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { ROUTES } from "@/lib/constants";

interface WorkspaceCardProps {
  workspace: Workspace;
  userId: string;
}

export function WorkspaceCard({ workspace, userId }: WorkspaceCardProps) {
  const [open, setOpen] = useState(false);
  const isOwner = workspace.owner_id === userId;

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Link
        href={`${ROUTES.WORKSPACES}/${workspace.id}`}
        className="block group"
      >
        <Card className="h-full border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 relative overflow-hidden rounded-xl p-5 gap-0 ring-0">
          {/* Decorative corner shape */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-300" />

          {/* Delete Icon Button - Only for Owner */}
          {isOwner && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-background/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              title="Delete Workspace"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <CardHeader className="p-0 gap-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Folder className="h-4 w-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Workspace
              </span>
            </div>
            <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate pr-4">
              {workspace.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-mono">
              /{workspace.slug}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-5 flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] text-muted-foreground"
                suppressHydrationWarning
              >
                Created: {formattedDate}
              </span>
              {workspace.owner_name && (
                <span className="text-[10px] text-muted-foreground/70">
                  Owner: <span className="font-semibold text-muted-foreground">{workspace.owner_name}</span>
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
              Open{" "}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>

      <DeleteWorkspaceDialog
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
