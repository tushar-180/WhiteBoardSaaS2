"use server";

import { requireActionAuth } from "@/utils/supabase/server";
import { fetchProfileById } from "@/services/profile";
import { fetchAllUserWorkspaces } from "@/services/workspace";

export async function getSettingsDataAction() {
  const { user } = await requireActionAuth("You must be logged in to view settings.");

  const [profile, workspaces] = await Promise.all([
    fetchProfileById(user.id),
    fetchAllUserWorkspaces(user.id),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email || "",
      name: profile?.name || user.email?.split("@")[0] || "User",
      avatar_url: profile?.avatar_url ?? null,
    },
    workspaces,
  };
}
