import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/store/use-notification-store";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";

const createMockInvite = (overrides: Partial<WorkspaceInviteWithWorkspace> = {}): WorkspaceInviteWithWorkspace => ({
  id: "invite-1",
  workspace_id: "ws-1",
  email: "test@example.com",
  token: "token-123",
  status: "pending",
  created_by: "user-1",
  accepted_by: null,
  role: "editor",
  workspace_name: "Test Workspace",
  created_at: "2025-06-18T12:00:00Z",
  ...overrides,
});

describe("useNotificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      invites: [],
      isLoading: false,
    });
  });

  it("initializes with empty invites and loading false", () => {
    const state = useNotificationStore.getState();
    expect(state.invites).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("setInvites replaces the invites array", () => {
    const invites = [createMockInvite()];
    useNotificationStore.getState().setInvites(invites);
    expect(useNotificationStore.getState().invites).toEqual(invites);
  });

  it("addInvite adds an invite to the beginning of the list", () => {
    const invite1 = createMockInvite({ id: "1" });
    const invite2 = createMockInvite({ id: "2" });

    useNotificationStore.getState().addInvite(invite1);
    useNotificationStore.getState().addInvite(invite2);

    const state = useNotificationStore.getState();
    expect(state.invites).toHaveLength(2);
    expect(state.invites[0].id).toBe("2"); // newest first
  });

  it("addInvite does not add duplicates", () => {
    const invite = createMockInvite();
    useNotificationStore.getState().addInvite(invite);
    useNotificationStore.getState().addInvite(invite);

    expect(useNotificationStore.getState().invites).toHaveLength(1);
  });

  it("removeInvite removes an invite by id", () => {
    const invite1 = createMockInvite({ id: "1" });
    const invite2 = createMockInvite({ id: "2" });
    useNotificationStore.getState().setInvites([invite1, invite2]);

    useNotificationStore.getState().removeInvite("1");

    const state = useNotificationStore.getState();
    expect(state.invites).toHaveLength(1);
    expect(state.invites[0].id).toBe("2");
  });

  it("removeInvite does nothing if id not found", () => {
    const invites = [createMockInvite()];
    useNotificationStore.getState().setInvites(invites);

    useNotificationStore.getState().removeInvite("non-existent");

    expect(useNotificationStore.getState().invites).toHaveLength(1);
  });

  it("setLoading updates the loading state", () => {
    useNotificationStore.getState().setLoading(true);
    expect(useNotificationStore.getState().isLoading).toBe(true);

    useNotificationStore.getState().setLoading(false);
    expect(useNotificationStore.getState().isLoading).toBe(false);
  });
});
