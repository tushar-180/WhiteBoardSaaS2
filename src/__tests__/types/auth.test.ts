import { describe, it, expect } from "vitest";
import { getAuthSchema } from "@/types/auth";

describe("authSchema", () => {
  const loginSchema = getAuthSchema(false);
  const signupSchema = getAuthSchema(true);

  it("validates login data (email + password only)", () => {
    expect(loginSchema.safeParse({ email: "test@example.com", password: "password123" }).success).toBe(true);
  });

  it("validates signup data (name + email + password)", () => {
    expect(signupSchema.safeParse({ name: "John", email: "test@example.com", password: "password123" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "password123" }).success).toBe(false);
  });

  it("rejects short password for signup", () => {
    expect(signupSchema.safeParse({ name: "John", email: "test@example.com", password: "12345" }).success).toBe(false);
  });
});
