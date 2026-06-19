import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "@/types/profile";

describe("updateProfileSchema", () => {
  it("validates a valid name", () => {
    const result = updateProfileSchema.safeParse({ name: "John Doe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });

  it("validates an empty object (all fields optional)", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 2 characters",
      );
    }
  });

  it("rejects a name longer than 50 characters", () => {
    const result = updateProfileSchema.safeParse({
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-string name", () => {
    const result = updateProfileSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields", () => {
    const result = updateProfileSchema.safeParse({
      name: "John",
      unknownField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("unknownField");
    }
  });
});
