import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchWorkspacesByOwner } from "@/services/workspace";
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

  // Fetch all workspaces owned by the authenticated user
  const workspaces = await fetchWorkspacesByOwner(user.id);

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <WorkspacesClient
      initialWorkspaces={workspaces}
      userEmail={user.email}
      userName={displayName}
    />
  );
}
