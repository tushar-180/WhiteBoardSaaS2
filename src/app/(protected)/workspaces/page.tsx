import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchWorkspacesByOwner } from "@/services/workspace";
import { fetchProfileById } from "@/services/profile";
import { WorkspacesClient } from "@/components/workspace/workspaces-client";

// Ensure the page fetches dynamic data on every request
export const revalidate = 0;

export default async function WorkspacesPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all workspaces owned by the authenticated user and user profile details from DB in parallel
  const [workspaces, profile] = await Promise.all([
    fetchWorkspacesByOwner(user.id),
    fetchProfileById(user.id),
  ]);

  const displayName = profile?.name || profile?.email?.split("@")[0] || user.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user.email || "";

  return (
    <WorkspacesClient
      initialWorkspaces={workspaces}
      userEmail={displayEmail}
      userName={displayName}
    />
  );
}
