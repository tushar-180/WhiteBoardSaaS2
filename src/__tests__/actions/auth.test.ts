import { it, expect, vi } from "vitest";
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/actions/auth";

it("signs out and redirects to login", async () => {
  const mockSupabase = { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } };
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  await signOutAction();
  expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  expect(redirect).toHaveBeenCalledWith("/login");
});
