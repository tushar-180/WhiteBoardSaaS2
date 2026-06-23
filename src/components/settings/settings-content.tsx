"use client";

import { useSettingsStore } from "@/store/settings-store";
import { ProfileSettings } from "./profile-settings";
import { WorkspacesSettings } from "./workspaces-settings";
import { NotificationsSettings } from "./notifications-settings";
import { AppearanceSettings } from "./appearance-settings";
import { AccountSettings } from "./account-settings";
import { BillingSettings } from "./billing-tab";
import { WorkspaceDetailPanel } from "./workspace-detail-panel";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsContent() {
  const { activeTab, activeWorkspaceId, setIsOpen } = useSettingsStore();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 hidden md:flex z-10"
        onClick={() => setIsOpen(false)}
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="flex-1 overflow-y-auto w-full px-4 md:px-0">
        {activeTab === "profile" && <ProfileSettings />}

        {activeTab === "workspaces" &&
          (activeWorkspaceId ? (
            <WorkspaceDetailPanel />
          ) : (
            <WorkspacesSettings />
          ))}

        {activeTab === "notifications" && <NotificationsSettings />}
        {activeTab === "appearance" && <AppearanceSettings />}
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "billing" && <BillingSettings />}
      </div>
    </div>
  );
}
