import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/store/settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      isOpen: false,
      activeTab: "profile",
      activeWorkspaceId: null,
      activeWorkspaceTab: "members",
    });
  });

  it("initializes with default state", () => {
    const state = useSettingsStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.activeTab).toBe("profile");
    expect(state.activeWorkspaceId).toBeNull();
    expect(state.activeWorkspaceTab).toBe("members");
  });

  it("setIsOpen toggles the open state", () => {
    useSettingsStore.getState().setIsOpen(true);
    expect(useSettingsStore.getState().isOpen).toBe(true);

    useSettingsStore.getState().setIsOpen(false);
    expect(useSettingsStore.getState().isOpen).toBe(false);
  });

  it("setActiveTab changes the active tab and resets workspaceId", () => {
    // Set a workspace id first
    useSettingsStore.getState().setActiveWorkspaceId("ws-1");
    expect(useSettingsStore.getState().activeWorkspaceId).toBe("ws-1");

    // Changing tab should reset workspaceId
    useSettingsStore.getState().setActiveTab("notifications");
    expect(useSettingsStore.getState().activeTab).toBe("notifications");
    expect(useSettingsStore.getState().activeWorkspaceId).toBeNull();
  });

  it("setActiveWorkspaceId sets the workspace id and resets tab to members", () => {
    useSettingsStore.getState().setActiveWorkspaceTab("danger");
    expect(useSettingsStore.getState().activeWorkspaceTab).toBe("danger");

    useSettingsStore.getState().setActiveWorkspaceId("ws-1");
    expect(useSettingsStore.getState().activeWorkspaceId).toBe("ws-1");
    expect(useSettingsStore.getState().activeWorkspaceTab).toBe("members");
  });

  it("setActiveWorkspaceTab changes the workspace tab", () => {
    useSettingsStore.getState().setActiveWorkspaceTab("invites");
    expect(useSettingsStore.getState().activeWorkspaceTab).toBe("invites");

    useSettingsStore.getState().setActiveWorkspaceTab("danger");
    expect(useSettingsStore.getState().activeWorkspaceTab).toBe("danger");
  });

  it("handles all tab values", () => {
    const tabs = ["profile", "workspaces", "notifications", "appearance", "account"] as const;
    for (const tab of tabs) {
      useSettingsStore.getState().setActiveTab(tab);
      expect(useSettingsStore.getState().activeTab).toBe(tab);
    }
  });

  it("handles all workspace tab values", () => {
    const tabs = ["members", "invites", "danger"] as const;
    for (const tab of tabs) {
      useSettingsStore.getState().setActiveWorkspaceTab(tab);
      expect(useSettingsStore.getState().activeWorkspaceTab).toBe(tab);
    }
  });

  it("setActiveWorkspaceId can set to null", () => {
    useSettingsStore.getState().setActiveWorkspaceId("ws-1");
    useSettingsStore.getState().setActiveWorkspaceId(null);
    expect(useSettingsStore.getState().activeWorkspaceId).toBeNull();
  });
});
