"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, LogOut, X, ArrowRight, Clock, MailQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptInviteAction, rejectInviteAction } from "@/actions/invite";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

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
  const [acceptJoinLoading, setAcceptJoinLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleAcceptOnly = async () => {
    setAcceptLoading(true);
    try {
      await acceptInviteAction(invite.token);
      toast.success("Successfully joined the workspace!");
    } catch (error: unknown) {
      toast.error(
        (error as Error).message ||
          "Failed to accept invitation. Please try again.",
      );
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleAcceptAndJoin = async () => {
    setAcceptJoinLoading(true);
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
      setAcceptJoinLoading(false);
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
    <div className="relative w-full max-w-md">
      <div className="relative p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-xl space-y-6 animate-in fade-in zoom-in duration-300 overflow-hidden">
        {/* Top gradient accent bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Close button */}
        <Link href={ROUTES.WORKSPACES} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-colors z-10">
          <X className="h-5 w-5" />
        </Link>

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-xs ring-1 ring-primary/10">
          <UserPlus className="h-7 w-7" />
        </div>

        {/* Title & description */}
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
            <span className="inline-flex items-center gap-1 font-mono bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary px-2 py-0.5 rounded-md text-xs font-bold capitalize ring-1 ring-primary/20">
              {invite.role}
            </span>
            .
          </p>
          <p className="text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3" />
            Sent{" "}
            {new Date(invite.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Account Info Box */}
        <div
          className={`rounded-xl border p-4 space-y-3 transition-all ${
            isDifferentEmail
              ? "border-destructive/30 bg-destructive/5"
              : "border-border/30 bg-muted/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`shrink-0 mt-0.5 rounded-full p-1 ${
                isDifferentEmail
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isDifferentEmail ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="space-y-1 w-full min-w-0">
              <p className="text-xs font-semibold text-foreground">
                Logged in as
              </p>
              <p className="font-mono text-[11px] sm:text-xs text-muted-foreground truncate">
                {currentUserEmail}
              </p>
            </div>
          </div>

          {isDifferentEmail && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-destructive">
                <MailQuestion className="h-4 w-4 shrink-0" />
                <p className="font-semibold text-xs">Email mismatch detected</p>
              </div>
              <div className="text-[11px] text-destructive/80 space-y-1.5 leading-relaxed">
                <p>
                  This invitation was sent to{" "}
                  <span className="font-mono font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    {invite.email}
                  </span>
                  , but you&apos;re logged in as a different user.
                </p>
                <p>
                  To accept this invitation, please log out and sign in with the email address it was sent to.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            onClick={handleAcceptAndJoin}
            disabled={acceptLoading || acceptJoinLoading || rejectLoading || isDifferentEmail}
            className="w-full h-11 rounded-xl font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {acceptJoinLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining workspace...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Accept &amp; Enter
              </>
            )}
          </Button>

          {!isDifferentEmail && (
            <>
              <Button
                onClick={handleAcceptOnly}
                disabled={acceptLoading || acceptJoinLoading || rejectLoading}
                variant="secondary"
                className="w-full h-11 rounded-xl font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                {acceptLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept Only"
                )}
              </Button>
              <Button
                onClick={handleReject}
                disabled={acceptLoading || acceptJoinLoading || rejectLoading}
                variant="ghost"
                className="w-full h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 active:scale-[0.98] transition-all cursor-pointer text-xs"
              >
                {rejectLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  "Decline invitation"
                )}
              </Button>
            </>
          )}

          {isDifferentEmail && (
            <Button
              variant="outline"
              onClick={async () => {
                const { createClient } = await import("@/utils/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
                toast.info(
                  "Logged out. Please sign in with the correct account.",
                );
                router.push(`${ROUTES.LOGIN}?next=/invite/${invite.token}`);
              }}
              disabled={acceptLoading || acceptJoinLoading || rejectLoading}
              className="w-full h-11 rounded-xl font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Switch Accounts
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
