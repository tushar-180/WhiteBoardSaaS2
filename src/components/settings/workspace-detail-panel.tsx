"use client";

import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MembersTab } from "./members-tab";
import { InvitesTab } from "./invites-tab";
import { DangerZoneTab } from "./danger-zone-tab";
import { cn } from "@/lib/utils";

export function WorkspaceDetailPanel() {
  const { workspaces, user } = useWorkspaceStore();
  const { activeWorkspaceId, setActiveWorkspaceId, activeWorkspaceTab, setActiveWorkspaceTab } = useSettingsStore();

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);

  if (!workspace) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground mb-4">Workspace not found.</p>
        <Button onClick={() => setActiveWorkspaceId(null)}>Go Back</Button>
      </div>
    );
  }

  const isOwner = workspace.owner_id === user?.id;
  const role = workspace.currentUserRole || (isOwner ? "owner" : "member");
  const showInvites = role === "owner" || role === "admin";

  const tabs = [
    { id: "members", label: "Members" },
    ...(showInvites ? [{ id: "invites", label: "Invites" }] : []),
    { id: "danger", label: "Danger Zone" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/50 bg-background sticky top-0 z-10 px-6 md:px-8 pt-6 pb-0">
        <Button 
          variant="ghost" 
          className="mb-4 -ml-4 text-muted-foreground hover:text-foreground" 
          onClick={() => setActiveWorkspaceId(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspaces
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">/{workspace.slug}</p>
        </div>

        <div className="flex items-center gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveWorkspaceTab(tab.id as any)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                activeWorkspaceTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {activeWorkspaceTab === "members" && <MembersTab workspace={workspace} currentUserRole={role as any} />}
        {activeWorkspaceTab === "invites" && showInvites && <InvitesTab workspace={workspace} />}
        {activeWorkspaceTab === "danger" && <DangerZoneTab workspace={workspace} isOwner={isOwner} />}
      </div>
    </div>
  );
}
