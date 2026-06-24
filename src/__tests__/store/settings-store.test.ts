import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/store/settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({ isOpen: false, activeTab: "profile", activeWorkspaceId: null, activeWorkspaceTab: "members" });
  });

  it("initializes with default state", () => {
    const state = useSettingsStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.activeTab).toBe("profile");
  });

  it("setIsOpen toggles the open state", () => {
    useSettingsStore.getState().setIsOpen(true);
    expect(useSettingsStore.getState().isOpen).toBe(true);
  });

  it("setActiveTab changes the active tab", () => {
    useSettingsStore.getState().setActiveTab("workspaces");
    expect(useSettingsStore.getState().activeTab).toBe("workspaces");
  });

  it("setActiveWorkspaceId sets the workspace id", () => {
    useSettingsStore.getState().setActiveWorkspaceId("ws-1");
    expect(useSettingsStore.getState().activeWorkspaceId).toBe("ws-1");
  });
});
