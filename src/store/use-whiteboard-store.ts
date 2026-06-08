import { create } from "zustand";
import { type SaveStatus } from "@/types/whiteboard";

interface WhiteboardState {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date | null) => void;
  reset: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  saveStatus: "idle",
  lastSavedAt: null,
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  reset: () => set({ saveStatus: "idle", lastSavedAt: null }),
}));
