"use client";

import { motion, AnimatePresence } from "motion/react";

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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent relative z-10">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 hidden md:flex z-50 rounded-full hover:bg-white/10 bg-background/20 backdrop-blur-md border border-white/10 shadow-lg transition-all hover:scale-105"
        onClick={() => setIsOpen(false)}
      >
        <X className="w-4 h-4 text-foreground/80" />
      </Button>

      <div className="flex-1 overflow-hidden w-full relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (activeWorkspaceId || "")}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 overflow-y-auto scrollbar-none flex flex-col px-4 md:px-8 py-4 md:py-8"
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
