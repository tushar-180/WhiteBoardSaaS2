import { describe, it, expect } from "vitest";
import { getAuthSchema } from "@/types/auth";

describe("authSchema", () => {
  const loginSchema = getAuthSchema(false);
  const signupSchema = getAuthSchema(true);

  it("validates login data (email + password only)", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBeUndefined();
    }
  });

  it("validates signup data (name + email + password)", () => {
    const result = signupSchema.safeParse({
      name: "John",
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John");
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("valid email");
    }
  });

  it("rejects a password shorter than 6 characters for signup", () => {
    const result = signupSchema.safeParse({
      name: "John",
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "at least 6 characters",
      );
    }
  });

  it("rejects an email longer than 100 characters", () => {
    const result = loginSchema.safeParse({
      email: "a".repeat(90) + "@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 72 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "A".repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password for login", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 50 characters during signup", () => {
    const result = loginSchema.safeParse({
      name: "A".repeat(51),
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a name at exactly 50 characters", () => {
    const result = loginSchema.safeParse({
      name: "A".repeat(50),
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });
});
