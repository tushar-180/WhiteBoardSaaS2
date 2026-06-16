import Link from "next/link";
import { ShieldAlert, ArrowRight, CheckCircle2, X } from "lucide-react";
import { requireAuth } from "@/utils/supabase/server";
import { fetchInviteByToken, fetchInviteByTokenAnyStatus } from "@/services/invite";
import { InviteAcceptClient } from "@/components/workspace/invite/invite-accept-client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    token: string;
  }>;
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
        // Invite already accepted
        return (
          <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10">
            <div className="relative w-full max-w-md p-5 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <Link href={ROUTES.WORKSPACES} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </Link>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Invite Already Accepted
                </h1>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  This invitation has already been accepted by another account. You may already be a member of{" "}
                  <span className="font-semibold">{inviteAnyStatus.workspace_name}</span>.
                </p>
              </div>

              <div className="border-t border-border/40 pt-4">
                <p className="text-xs text-muted-foreground/60 mb-6">
                  Try accessing the workspace from your dashboard or ask the administrator if you need a new invite.
                </p>
                <Button asChild className="w-full h-10 rounded-xl font-semibold cursor-pointer">
                  <Link href={ROUTES.WORKSPACES}>
                    Go to Dashboard
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        );
      } else if (inviteAnyStatus.status === "revoked") {
        // Invite was revoked
        return (
          <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10">
            <div className="relative w-full max-w-md p-5 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <Link href={ROUTES.WORKSPACES} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </Link>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Invite Revoked
                </h1>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  This invitation has been revoked by the workspace administrator and can no longer be used.
                </p>
              </div>

              <div className="border-t border-border/40 pt-4">
                <p className="text-xs text-muted-foreground/60 mb-6">
                  Please ask the workspace administrator to send you a new invitation link.
                </p>
                <Button asChild className="w-full h-10 rounded-xl font-semibold cursor-pointer">
                  <Link href={ROUTES.WORKSPACES}>
                    Go to Dashboard
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        );
      }
    }

    // Invite not found or invalid token
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10">
        <div className="relative w-full max-w-md p-5 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <Link href={ROUTES.WORKSPACES} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </Link>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Invalid or Expired Invite
            </h1>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              This invitation link is invalid or has expired.
            </p>
          </div>

          <div className="border-t border-border/40 pt-4">
            <p className="text-xs text-muted-foreground/60 mb-6">
              Please ask the workspace administrator to send you a new invitation link.
            </p>
            <Button asChild className="w-full h-10 rounded-xl font-semibold cursor-pointer">
              <Link href={ROUTES.WORKSPACES}>
                Go to Dashboard
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 2. Render confirmation page
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-purple-900/10">
      <InviteAcceptClient
        invite={invite}
        currentUserEmail={user.email || ""}
      />
    </main>
  );
}
