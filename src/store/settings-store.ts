import { create } from "zustand";

export type SettingsTab = "profile" | "workspaces" | "notifications" | "appearance" | "account" | "billing";
export type WorkspaceDetailTab = "members" | "invites" | "danger";

interface SettingsState {
  isOpen: boolean;
  activeTab: SettingsTab;
  activeWorkspaceId: string | null;
  activeWorkspaceTab: WorkspaceDetailTab;
  
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: SettingsTab) => void;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
  setActiveWorkspaceTab: (tab: WorkspaceDetailTab) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isOpen: false,
  activeTab: "profile",
  activeWorkspaceId: null,
  activeWorkspaceTab: "members",
  
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab, activeWorkspaceId: null }),
  setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId, activeWorkspaceTab: "members" }),
  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),
}));
