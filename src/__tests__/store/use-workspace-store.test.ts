import { describe, it, expect, beforeEach } from "vitest";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { type Workspace } from "@/types/workspace";

const createMockWorkspace = (overrides: Partial<Workspace> = {}): Workspace => ({
  id: "ws-1",
  name: "Test Workspace",
  slug: "test-workspace-abc1",
  owner_id: "user-1",
  created_at: "2025-06-18T12:00:00Z",
  updated_at: "2025-06-18T12:00:00Z",
  ...overrides,
});

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      workspaces: [],
      user: null,
      isLoading: false,
    });
  });

  it("initializes with default state", () => {
    const state = useWorkspaceStore.getState();
    expect(state.workspaces).toEqual([]);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("setWorkspaces replaces the workspaces array", () => {
    const workspaces = [createMockWorkspace()];
    useWorkspaceStore.getState().setWorkspaces(workspaces);
    expect(useWorkspaceStore.getState().workspaces).toEqual(workspaces);
  });

  it("addWorkspace adds a workspace to the beginning", () => {
    const ws1 = createMockWorkspace({ id: "1", name: "WS 1" });
    const ws2 = createMockWorkspace({ id: "2", name: "WS 2" });

    useWorkspaceStore.getState().addWorkspace(ws1);
    useWorkspaceStore.getState().addWorkspace(ws2);

    const state = useWorkspaceStore.getState();
    expect(state.workspaces).toHaveLength(2);
    expect(state.workspaces[0].name).toBe("WS 2");
  });

  it("deleteWorkspace removes a workspace by id", () => {
    const ws1 = createMockWorkspace({ id: "1" });
    const ws2 = createMockWorkspace({ id: "2" });
    useWorkspaceStore.getState().setWorkspaces([ws1, ws2]);

    useWorkspaceStore.getState().deleteWorkspace("1");

    expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);
    expect(useWorkspaceStore.getState().workspaces[0].id).toBe("2");
  });

  it("deleteWorkspace does nothing if id not found", () => {
    const workspaces = [createMockWorkspace()];
    useWorkspaceStore.getState().setWorkspaces(workspaces);

    useWorkspaceStore.getState().deleteWorkspace("non-existent");

    expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);
  });

  it("setUser sets the user profile", () => {
    const user = { id: "user-1", email: "test@example.com", name: "Test User" };
    useWorkspaceStore.getState().setUser(user);
    expect(useWorkspaceStore.getState().user).toEqual(user);
  });

  it("setUser can set to null", () => {
    useWorkspaceStore.getState().setUser({ id: "1", email: "a@b.com", name: "A" });
    useWorkspaceStore.getState().setUser(null);
    expect(useWorkspaceStore.getState().user).toBeNull();
  });

  it("setLoading updates the loading state", () => {
    useWorkspaceStore.getState().setLoading(true);
    expect(useWorkspaceStore.getState().isLoading).toBe(true);

    useWorkspaceStore.getState().setLoading(false);
    expect(useWorkspaceStore.getState().isLoading).toBe(false);
  });
});
