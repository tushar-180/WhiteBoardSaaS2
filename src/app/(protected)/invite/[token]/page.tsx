import Link from "next/link";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { ShieldAlert, ArrowRight, CheckCircle2, X, RefreshCw } from "lucide-react";
import { requireAuth } from "@/utils/supabase/server";
import { fetchInviteByToken, fetchInviteByTokenAnyStatus } from "@/services/invite";
import { InviteAcceptClient } from "@/components/workspace/invite/invite-accept-client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Accept Invitation",
  description: "Join a Zentrox workspace with your invitation link.",
};

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

function ErrorCard({
  icon,
  iconBg,
  iconColor,
  accentColor,
  title,
  description,
  helpText,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  title: string;
  description: ReactNode;
  helpText: string;
}) {
  const accentStyle = {
    background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300 overflow-hidden">
        {/* Top accent bar */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] opacity-40"
          style={accentStyle}
        />
        
        <Link href={ROUTES.WORKSPACES} prefetch={false} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors z-10">
          <X className="h-5 w-5" />
        </Link>
        
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-xs`}>
          {icon}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground/60 mb-5">
            {helpText}
          </p>
          <Button asChild className="w-full h-10 rounded-xl font-semibold cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-[0.98]">
            <Link href={ROUTES.WORKSPACES} prefetch={false}>
              Go to Dashboard
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;
  const { user } = await requireAuth(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

  // 1. Fetch details of the invite token (pending only)
  const invite = await fetchInviteByToken(token);

  // If not pending, check if it exists with a different status
  if (!invite) {
    const inviteAnyStatus = await fetchInviteByTokenAnyStatus(token);
    
    // Determine the reason for failure
    if (inviteAnyStatus) {
      if (inviteAnyStatus.status === "accepted") {
        return (
          <main className="flex min-h-dvh flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10 relative">
            {/* Subtle background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <ErrorCard
              icon={<CheckCircle2 className="h-7 w-7" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-600"
              accentColor="oklch(0.769 0.188 70.08)"
              title="Invite Already Accepted"
              description={
                <>
                  This invitation has already been accepted. You may already be a member of{" "}
                  <span className="font-semibold text-foreground">{inviteAnyStatus.workspace_name}</span>.
                </>
              }
              helpText="Try accessing the workspace from your dashboard or ask the administrator if you need a new invite."
            />
          </main>
        );
      } else if (inviteAnyStatus.status === "revoked") {
        return (
          <main className="flex min-h-dvh flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10 relative">
            <ErrorCard
              icon={<ShieldAlert className="h-7 w-7" />}
              iconBg="bg-destructive/10"
              iconColor="text-destructive"
              accentColor="oklch(0.704 0.191 22.216)"
              title="Invite Revoked"
              description="This invitation has been revoked by the workspace administrator and can no longer be used."
              helpText="Please ask the workspace administrator to send you a new invitation link."
            />
          </main>
        );
      }
    }

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10 relative">
        <div className="relative w-full max-w-md">
          <div className="relative p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div
              className="absolute top-0 inset-x-0 h-[2px] opacity-40"
              style={{ background: "linear-gradient(to right, transparent, oklch(0.704 0.191 22.216), transparent)" }}
            />
            
            <Link href={ROUTES.WORKSPACES} prefetch={false} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors z-10">
              <X className="h-5 w-5" />
            </Link>
            
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 text-destructive shadow-xs ring-1 ring-destructive/10">
              <RefreshCw className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Invalid or Expired Link
              </h1>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
                This invitation link is no longer valid. It may have expired or the invite was already used.
              </p>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3">
              <p className="text-xs text-muted-foreground/60">
                Please ask the workspace administrator to send you a new invitation link.
              </p>
              <Button asChild className="w-full h-10 rounded-xl font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98]">
                <Link href={ROUTES.WORKSPACES} prefetch={false}>
                  Go to Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Render confirmation page with decorative background
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <InviteAcceptClient
        invite={invite}
        currentUserEmail={user.email || ""}
      />
    </main>
  );
}
