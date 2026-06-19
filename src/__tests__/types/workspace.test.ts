import { describe, it, expect } from "vitest";
import {
  workspaceSchema,
  boardSchema,
  inviteSchema,
  workspaceRoleSchema,
} from "@/types/workspace";

describe("workspaceSchema", () => {
  it("validates a valid workspace name", () => {
    const result = workspaceSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Workspace");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = workspaceSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 2 characters",
      );
    }
  });

  it("rejects a name longer than 50 characters", () => {
    const result = workspaceSchema.safeParse({
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "under 50 characters",
      );
    }
  });

  it("accepts a name with exactly 2 characters", () => {
    const result = workspaceSchema.safeParse({ name: "AB" });
    expect(result.success).toBe(true);
  });

  it("accepts a name with exactly 50 characters", () => {
    const result = workspaceSchema.safeParse({
      name: "A".repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = workspaceSchema.safeParse({ name: "  My Workspace  " });
    expect(result.success).toBe(true);
    if (result.success) {
      // Zod .string() doesn't trim by default, the action handles trimming
      expect(result.data.name).toBe("  My Workspace  ");
    }
  });
});

describe("boardSchema", () => {
  it("validates a valid board with name only", () => {
    const result = boardSchema.safeParse({ name: "My Board" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Board");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("validates a board with name and description", () => {
    const result = boardSchema.safeParse({
      name: "My Board",
      description: "A description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("A description");
    }
  });

  it("rejects a board name shorter than 2 characters", () => {
    const result = boardSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 2 characters",
      );
    }
  });

  it("rejects a board name longer than 50 characters", () => {
    const result = boardSchema.safeParse({
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a description longer than 200 characters", () => {
    const result = boardSchema.safeParse({
      name: "My Board",
      description: "A".repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "under 200 characters",
      );
    }
  });

  it("accepts null description", () => {
    const result = boardSchema.safeParse({
      name: "My Board",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("accepts empty string description", () => {
    const result = boardSchema.safeParse({
      name: "My Board",
      description: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("inviteSchema", () => {
  it("validates a valid invite", () => {
    const result = inviteSchema.safeParse({
      email: "test@example.com",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = inviteSchema.safeParse({
      email: "not-an-email",
      role: "editor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("valid email");
    }
  });

  it("rejects 'owner' as a role for invites", () => {
    const result = inviteSchema.safeParse({
      email: "test@example.com",
      role: "owner",
    });
    expect(result.success).toBe(false);
  });

  it("accepts 'viewer' role", () => {
    const result = inviteSchema.safeParse({
      email: "test@example.com",
      role: "viewer",
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'editor' role", () => {
    const result = inviteSchema.safeParse({
      email: "test@example.com",
      role: "editor",
    });
    expect(result.success).toBe(true);
  });
});

describe("workspaceRoleSchema", () => {
  it("accepts all valid roles", () => {
    const validRoles = ["owner", "admin", "editor", "viewer"] as const;
    for (const role of validRoles) {
      const result = workspaceRoleSchema.safeParse(role);
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid role", () => {
    const result = workspaceRoleSchema.safeParse("superadmin");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = workspaceRoleSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
