import { requireAuth } from "@/utils/supabase/server";
import { fetchProfileById } from "@/services/profile";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { getUserSubscriptionAction } from "@/actions/settings";
import dynamic from "next/dynamic";

const SettingsModal = dynamic(() => import("@/components/settings/settings-modal").then((m) => ({ default: m.SettingsModal })));

export default async function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();
  const profile = await fetchProfileById(user.id);

  const displayEmail = profile?.email || user.email || "";

  // Fetch subscription plan
  const subscription = await getUserSubscriptionAction();
  const planType = subscription.plan_type as "free" | "pro" | "ultra";

  return (
    <div className="flex flex-col h-screen w-full bg-background relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <WorkspaceNav 
        userEmail={displayEmail} 
        userId={user.id} 
        userName={profile?.name || undefined}
        userAvatar={profile?.avatar_url || undefined}
        logoHref="/"
        planType={planType}
      />

      <SettingsModal />

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">{children}</div>
    </div>
  );
}
