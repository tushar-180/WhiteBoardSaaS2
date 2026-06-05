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

  return (
    <WorkspacesClient
      initialWorkspaces={workspaces}
      userEmail={user.email}
    />
  );
}
