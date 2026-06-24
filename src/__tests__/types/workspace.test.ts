import { describe, it, expect } from "vitest";
import { workspaceSchema, boardSchema, inviteSchema, workspaceRoleSchema } from "@/types/workspace";

describe("workspaceSchema", () => {
  it("validates a valid workspace name and rejects short names", () => {
    expect(workspaceSchema.safeParse({ name: "My Workspace" }).success).toBe(true);
    expect(workspaceSchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("boardSchema", () => {
  it("validates a board and rejects long descriptions", () => {
    expect(boardSchema.safeParse({ name: "My Board" }).success).toBe(true);
    expect(boardSchema.safeParse({ name: "My Board", description: "A".repeat(201) }).success).toBe(false);
  });
});

describe("inviteSchema", () => {
  it("validates valid invites and rejects invalid email/role", () => {
    expect(inviteSchema.safeParse({ email: "test@example.com", role: "admin" }).success).toBe(true);
    expect(inviteSchema.safeParse({ email: "not-an-email", role: "editor" }).success).toBe(false);
    expect(inviteSchema.safeParse({ email: "test@example.com", role: "owner" }).success).toBe(false);
  });
});

describe("workspaceRoleSchema", () => {
  it("accepts valid roles and rejects invalid ones", () => {
    for (const role of ["owner", "admin", "editor", "viewer"] as const) {
      expect(workspaceRoleSchema.safeParse(role).success).toBe(true);
    }
    expect(workspaceRoleSchema.safeParse("superadmin").success).toBe(false);
  });
});
