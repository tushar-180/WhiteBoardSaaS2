import { describe, it, expect, beforeEach } from "vitest";
import { useWorkspaceStore } from "@/store/use-workspace-store";

describe("useWorkspaceStore", () => {
  beforeEach(() => { useWorkspaceStore.setState({ workspaces: [], user: null, isLoading: false }); });

  it("initializes with default state", () => {
    expect(useWorkspaceStore.getState().workspaces).toEqual([]);
  });

  it("addWorkspace adds to beginning and deleteWorkspace removes by id", () => {
    const ws1 = { id: "1", name: "WS 1", slug: "ws-1", owner_id: "u1", created_at: "", updated_at: "" };
    const ws2 = { id: "2", name: "WS 2", slug: "ws-2", owner_id: "u1", created_at: "", updated_at: "" };
    useWorkspaceStore.getState().addWorkspace(ws1);
    useWorkspaceStore.getState().addWorkspace(ws2);
    expect(useWorkspaceStore.getState().workspaces).toHaveLength(2);
    expect(useWorkspaceStore.getState().workspaces[0].name).toBe("WS 2");
    useWorkspaceStore.getState().deleteWorkspace("1");
    expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);
  });

  it("setUser sets and clears user", () => {
    useWorkspaceStore.getState().setUser({ id: "u1", email: "a@b.com", name: "A" });
    expect(useWorkspaceStore.getState().user).toBeTruthy();
    useWorkspaceStore.getState().setUser(null);
    expect(useWorkspaceStore.getState().user).toBeNull();
  });

  it("setLoading updates the loading state", () => {
    useWorkspaceStore.getState().setLoading(true);
    expect(useWorkspaceStore.getState().isLoading).toBe(true);
  });
});
