import { describe, it, expect } from "vitest";
import { ROUTES, ASSETS, DEFAULT_REDIRECTS } from "@/lib/constants";

describe("ROUTES", () => {
  it("has all expected route keys", () => {
    expect(ROUTES).toMatchObject({
      HOME: "/", LOGIN: "/login", REGISTER: "/register",
      WORKSPACES: "/workspaces", BOARD: "/board",
    });
  });
});

describe("ASSETS", () => {
  it("has the logo path", () => { expect(ASSETS.LOGO).toBe("/logo.webp"); });
});

describe("DEFAULT_REDIRECTS", () => {
  it("redirects correctly after login, signup, and auth fallback", () => {
    expect(DEFAULT_REDIRECTS.AFTER_LOGIN).toBe("/workspaces");
    expect(DEFAULT_REDIRECTS.AFTER_SIGNUP).toBe("/");
    expect(DEFAULT_REDIRECTS.AUTH_FALLBACK).toBe("/login");
  });
});
