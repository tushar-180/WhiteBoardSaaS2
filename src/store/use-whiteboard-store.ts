import { create } from "zustand";
import { type SaveStatus } from "@/types/whiteboard";

interface WhiteboardState {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isOffline: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date | null) => void;
  setIsOffline: (isOffline: boolean) => void;
  reset: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  saveStatus: "idle",
  lastSavedAt: null,
  isOffline: false,
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setIsOffline: (isOffline) => set({ isOffline }),
  reset: () => set({ saveStatus: "idle", lastSavedAt: null, isOffline: false }),
}));
