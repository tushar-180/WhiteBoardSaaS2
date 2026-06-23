"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { createInviteAction, searchProfilesAction } from "@/actions/invite";
import { inviteSchema, type InviteFormData } from "@/types/workspace";
import { type Profile } from "@/types/profile";
import { getUserSubscriptionAction } from "@/actions/settings";
import { checkMemberLimitAction } from "@/actions/billing";
import type { PlanType, LimitCheckResult } from "@/types/billing";
import { InviteForm } from "./invite/invite-form";
import { InviteSuccess } from "./invite/invite-success";

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const LIMIT_KEYWORDS = ["does not support", "plan limit", "reached the"];

function isLimitError(message: string): boolean {
  return LIMIT_KEYWORDS.some((kw) => message.toLowerCase().includes(kw));
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    link: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [limitCheck, setLimitCheck] = useState<LimitCheckResult | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Proactive limit check when dialog opens
  useEffect(() => {
    if (!open || !workspaceId) return;
    setCheckingLimit(true);
    setLimitCheck(null);
    checkMemberLimitAction(workspaceId)
      .then(setLimitCheck)
      .catch(() => setLimitCheck(null))
      .finally(() => setCheckingLimit(false));
  }, [open, workspaceId]);

  // When upgrade pricing popup opens, close parent dialog so only one overlay exists
  useEffect(() => {
    if (showUpgrade) {
      onOpenChange(false);
    }
  }, [showUpgrade, onOpenChange]);

  const fetchCurrentPlan = async () => {
    try {
      const sub = await getUserSubscriptionAction();
      setCurrentPlan((sub.plan_type as PlanType) || "free");
    } catch {
      setCurrentPlan("free");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "editor",
    },
  });

  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const emailValue = useWatch({ control, name: "email" }) as string | undefined;

  // Debounced search for profiles
  useEffect(() => {
    if (!emailValue || emailValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchProfilesAction(emailValue);
        setSuggestions(results);
      } catch (err) {
        console.error("Search profiles error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [emailValue]);

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    setInviteResult(null);
    try {
      const result = await createInviteAction(workspaceId, data.email, data.role);
      
      setInviteResult({
        link: result.inviteLink,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });

      if (result.emailSent) {
        toast.success(`Invitation email sent to ${data.email}!`);
      } else if (result.emailError) {
        console.error("Email sending failed:", result.emailError);
        toast.error("Email server is currently down. The invite was created, please share the magic link manually.");
      } else {
        toast.success(`Magic invite link created successfully!`);
      }

      reset();
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: unknown) {
      const message = (error as Error).message || "";
      if (isLimitError(message)) {
        await fetchCurrentPlan();
        setShowUpgrade(true);
      } else {
        toast.error(message || "Failed to invite member. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setInviteResult(null);
    onOpenChange(false);
    // Refresh page data
    router.refresh();
  };

  const isAtLimit = limitCheck && !limitCheck.allowed;

  return (
    <Dialog open={open} loading={loading} onOpenChange={(val) => {
      if (!val) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {isAtLimit ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Lock className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold">Member Limit Reached</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground text-xs">
                You&apos;ve hit the member limit for your current plan.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Current usage</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500">
                    {limitCheck.limit === 0 ? "—" : `${limitCheck.current} / ${limitCheck.limit}`}
                  </span>
                </div>
                <div className="w-full h-2 bg-amber-500/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min((limitCheck.current / Math.max(limitCheck.limit, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="uppercase tracking-wide text-[10px] mr-1 bg-amber-500/5 text-amber-500 border-amber-500/20">
                    {limitCheck.planType}
                  </Badge>
                  {limitCheck.planType === "free"
                    ? "The Free plan does not support additional members. Upgrade to invite your team."
                    : `Plan allows ${limitCheck.limit} members.`}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  onClick={async () => {
                    await fetchCurrentPlan();
                    setShowUpgrade(true);
                  }}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </>
        ) : checkingLimit ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold">Invite Collaborator</DialogTitle>
              </div>
            </DialogHeader>
            <div className="py-8 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold">Invite Collaborator</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground text-xs">
                Add team members to work together on your boards.
              </DialogDescription>
            </DialogHeader>

            {!inviteResult ? (
              <InviteForm
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                loading={loading}
                searchLoading={searchLoading}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                setSuggestions={setSuggestions}
                setValue={setValue}
                trigger={trigger}
                onClose={handleClose}
              />
            ) : (
              <InviteSuccess
                inviteLink={inviteResult.link}
                emailSent={inviteResult.emailSent}
                onClose={handleClose}
              />
            )}
          </>
        )}
      </DialogContent>

      {/* Upgrade Dialog shown on plan limit errors */}
      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        currentPlan={currentPlan}
        limitType="member"
      />
    </Dialog>
  );
}
