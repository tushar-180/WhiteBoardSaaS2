"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorkspaceCard } from "./workspace-card";
import { useWorkspaceStore } from "@/store/use-workspace-store";


interface WorkspaceListProps {
  userId: string;
  onCreateClick: () => void;
}

export function WorkspaceList({ userId, onCreateClick }: WorkspaceListProps) {
  const workspaces = useWorkspaceStore((state) => state.workspaces);

  const ownedWorkspaces = workspaces.filter((w) => w.owner_id === userId);
  const joinedWorkspaces = workspaces.filter((w) => w.owner_id !== userId);

  return (
    <div className="space-y-10">
      {/* Owned Workspaces Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Owned by Me ({ownedWorkspaces.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Create New Workspace Action Card */}
          <button onClick={onCreateClick} className="block text-left group h-full cursor-pointer focus:outline-none">
            <Card className="h-full min-h-[160px] border border-dashed border-border/100 bg-background/30 transition-all duration-300 hover:border-primary/60 hover:bg-muted/10 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 ring-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 border border-border/80 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-xs">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors duration-200">
                Create Workspace
              </span>
              <span className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                Set up a new space for your boards and team.
              </span>
            </Card>
          </button>

          {/* Render Workspace Cards */}
          {ownedWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                userId={userId}
              />
          ))}
        </div>
      </div>

      {/* Joined Workspaces Section */}
      {joinedWorkspaces.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Joined Workspaces ({joinedWorkspaces.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {joinedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  userId={userId}
                />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
