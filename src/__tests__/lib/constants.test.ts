import { describe, it, expect } from "vitest";
import { ROUTES, ASSETS, DEFAULT_REDIRECTS } from "@/lib/constants";

describe("ROUTES", () => {
  it("has all expected route keys", () => {
    expect(ROUTES).toMatchObject({
      HOME: "/",
      LOGIN: "/login",
      REGISTER: "/register",
      WORKSPACES: "/workspaces",
      BOARD: "/board",
      AUTH_CALLBACK: "/auth/callback",
      SETTINGS: "/settings",
    });
  });

  it("all routes start with /", () => {
    Object.values(ROUTES).forEach((route) => {
      expect(route).toMatch(/^\//);
    });
  });
});

describe("ASSETS", () => {
  it("has the logo path", () => {
    expect(ASSETS.LOGO).toBe("/logo.webp");
  });
});

describe("DEFAULT_REDIRECTS", () => {
  it("redirects to workspaces after login", () => {
    expect(DEFAULT_REDIRECTS.AFTER_LOGIN).toBe("/workspaces");
  });

  it("redirects to home after signup", () => {
    expect(DEFAULT_REDIRECTS.AFTER_SIGNUP).toBe("/");
  });

  it("redirects to login as auth fallback", () => {
    expect(DEFAULT_REDIRECTS.AUTH_FALLBACK).toBe("/login");
  });
});
