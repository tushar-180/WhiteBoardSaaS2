"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSettingsStore } from "@/store/settings-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { getSettingsDataAction } from "@/actions/settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const SettingsSidebar = dynamic(
  () =>
    import("./settings-sidebar").then((m) => ({ default: m.SettingsSidebar })),
  { ssr: false },
);
const SettingsContent = dynamic(
  () =>
    import("./settings-content").then((m) => ({ default: m.SettingsContent })),
  { ssr: false },
);

// Main settings wrapper

export function SettingsModal() {
  const { isOpen, setIsOpen } = useSettingsStore();
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setUser = useWorkspaceStore((s) => s.setUser);

  const fetchSettingsData = useCallback(async () => {
    try {
      const data = await getSettingsDataAction();
      setUser(data.user);
      setWorkspaces(data.workspaces);
    } catch {
      // Silently fail — user can still navigate to other pages
    }
  }, [setUser, setWorkspaces]);

  useEffect(() => {
    if (isOpen) {
      fetchSettingsData();
    }
  }, [isOpen, fetchSettingsData]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[1000px] h-[90dvh] max-h-[90dvh] sm:h-[85vh] p-0 flex flex-col md:flex-row overflow-hidden bg-background/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your account, workspaces, notifications, appearance, and
          account settings.
        </DialogDescription>
        <SettingsSidebar />
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
}
