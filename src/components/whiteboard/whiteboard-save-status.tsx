"use client";

import { Cloud, CloudLightning, CloudOff, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";

interface WhiteboardSaveStatusProps {
  onSave: () => void;
}

export default function WhiteboardSaveStatus({
  onSave,
}: WhiteboardSaveStatusProps) {
  const saveStatus = useWhiteboardStore((state) => state.saveStatus);
  const lastSavedAt = useWhiteboardStore((state) => state.lastSavedAt);

  return (
    <div className="flex items-center gap-3">
      {saveStatus === "saved" && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          title={
            lastSavedAt
              ? `Last saved at ${lastSavedAt.toLocaleTimeString()}`
              : undefined
          }
        >
          <Cloud className="h-3.5 w-3.5" />
          <span>Saved</span>
        </div>
      )}

      {saveStatus === "saving" && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {saveStatus === "unsaved" && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <CloudLightning className="h-3.5 w-3.5 animate-pulse" />
          <span>Unsaved changes</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          <CloudOff className="h-3.5 w-3.5" />
          <span>Save failed</span>
        </div>
      )}

      {/* Save Button for Manual Force Save */}
      {(saveStatus === "unsaved" || saveStatus === "error") && (
        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs gap-1.5 border-primary/30 hover:border-primary hover:text-primary transition-all duration-200"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Now</span>
        </Button>
      )}
    </div>
  );
}
