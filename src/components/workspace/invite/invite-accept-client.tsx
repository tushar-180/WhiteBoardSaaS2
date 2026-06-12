"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptInviteAction, rejectInviteAction } from "@/actions/invite";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";

interface InviteAcceptClientProps {
  invite: WorkspaceInviteWithWorkspace;
  currentUserEmail: string;
}

export function InviteAcceptClient({
  invite,
  currentUserEmail,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      const workspaceId = await acceptInviteAction(invite.token);
      toast.success("Successfully joined the workspace!");
      router.push(`${ROUTES.WORKSPACES}/${workspaceId}`);
    } catch (error: unknown) {
      toast.error(
        (error as Error).message ||
          "Failed to accept invitation. Please try again.",
      );
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await rejectInviteAction(invite.token);
      toast.success("Invitation rejected successfully.");
      router.push(ROUTES.WORKSPACES);
    } catch (error: unknown) {
      toast.error(
        (error as Error).message ||
          "Failed to reject invitation. Please try again.",
      );
    } finally {
      setRejectLoading(false);
    }
  };

  const isDifferentEmail =
    invite.email.toLowerCase() !== currentUserEmail.toLowerCase();

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <UserPlus className="h-7 w-7" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Accept Workspace Invitation
        </h1>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          You have been invited to join{" "}
          <span className="font-semibold text-foreground">
            {invite.workspace_name}
          </span>{" "}
          as a{" "}
          <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs font-bold capitalize">
            {invite.role}
          </span>
          .
        </p>
      </div>

      {/* Account Info Box */}
      <div className={`rounded-xl border p-4 space-y-3 ${
        isDifferentEmail
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/30 bg-muted/30"
      }`}>
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
          {isDifferentEmail ? (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 w-full">
            <p className="font-medium text-foreground">
              Logged in as:
            </p>
            <p className="font-mono text-[10px] sm:text-xs text-primary/90">
              {currentUserEmail}
            </p>
          </div>
        </div>

        {isDifferentEmail && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-[11px] text-destructive space-y-2">
            <p className="font-semibold">
              ❌ Email mismatch!
            </p>
            <p>
              This invitation was sent to{" "}
              <span className="font-mono font-semibold">{invite.email}</span>.
            </p>
            <p>
              To accept this invitation, you must log in with that email address.
            </p>
            <p>
              If you don&apos;t log in with the correct email address, you won&apos;t be able to accept it.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleAccept}
          disabled={acceptLoading || rejectLoading || isDifferentEmail}
          className="w-full h-10 rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          {acceptLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Accept Invitation"
          )}
        </Button>

        {!isDifferentEmail && (
          <Button
            onClick={handleReject}
            disabled={acceptLoading || rejectLoading}
            variant="outline"
            className="w-full h-10 rounded-xl font-semibold cursor-pointer"
          >
            {rejectLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              "Decline"
            )}
          </Button>
        )}

        {isDifferentEmail && (
          <Button
            variant="ghost"
            onClick={async () => {
              // Sign out of current account and refresh/redirect to login page
              const { createClient } = await import("@/utils/supabase/client");
              const supabase = createClient();
              await supabase.auth.signOut();
              toast.info(
                "Logged out. Please log in or register with your other account.",
              );
              router.push(`${ROUTES.LOGIN}?next=/invite/${invite.token}`);
            }}
            disabled={acceptLoading || rejectLoading}
            className="w-full h-10 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer text-xs"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Switch Accounts
          </Button>
        )}
      </div>
    </div>
  );
}
