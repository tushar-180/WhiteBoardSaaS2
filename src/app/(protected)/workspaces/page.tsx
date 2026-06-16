import { Metadata } from "next";
import { requireAuth } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Workspaces",
  description: "Manage your Zentrox workspaces and boards.",
};
import { fetchAllUserWorkspaces } from "@/services/workspace";
import { fetchProfileById } from "@/services/profile";
import { WorkspacesClient } from "@/components/workspace/workspaces-client";

// Ensure the page fetches dynamic data on every request
export const revalidate = 0;

export default async function WorkspacesPage() {
  const { user } = await requireAuth();

  // Fetch all workspaces (owned and joined) with owner info and user profile details from DB in parallel
  const [workspaces, profile] = await Promise.all([
    fetchAllUserWorkspaces(user.id),
    fetchProfileById(user.id),
  ]);

  const displayName =
    profile?.name ||
    profile?.email?.split("@")[0] ||
    user.email?.split("@")[0] ||
    "User";
  const displayEmail = profile?.email || user.email || "";

  return (
    <WorkspacesClient
      initialWorkspaces={workspaces}
      userId={user.id}
      userEmail={displayEmail}
      userName={displayName}
    />
  );
}
