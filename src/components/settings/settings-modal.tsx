"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsContent } from "./settings-content";

// Main settings wrapper

export function SettingsModal() {
  const { isOpen, setIsOpen } = useSettingsStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-[1000px] max-w-[1000px] w-[95vw] h-[85vh] p-0 flex flex-col md:flex-row overflow-hidden bg-background border-border/50 shadow-2xl rounded-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <SettingsSidebar />
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
}
