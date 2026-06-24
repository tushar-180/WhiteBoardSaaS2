import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "@/types/profile";

describe("updateProfileSchema", () => {
  it("validates a valid name", () => {
    expect(updateProfileSchema.safeParse({ name: "John Doe" }).success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "J" });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields", () => {
    const result = updateProfileSchema.safeParse({ name: "John", unknownField: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("unknownField");
  });
});
