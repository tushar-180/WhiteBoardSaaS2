"use client";

import { useState, useCallback, useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, FolderPlus, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { createWorkspaceAction } from "@/actions/workspace";
import { workspaceSchema, type WorkspaceFormData } from "@/types/workspace";
import { getUserSubscriptionAction } from "@/actions/settings";
import { checkWorkspaceLimitAction } from "@/actions/billing";
import type { PlanType, LimitCheckResult } from "@/types/billing";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LIMIT_KEYWORDS = ["reached the", "plan limit"];

function isLimitError(message: string): boolean {
  return LIMIT_KEYWORDS.every((kw) => message.toLowerCase().includes(kw));
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [limitCheck, setLimitCheck] = useState<LimitCheckResult | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Proactive limit check when dialog opens
  useEffect(() => {
    if (!open) return;
    // Defer state updates to microtask to avoid cascading render warning
    Promise.resolve().then(() => {
      setLimitCheck(null);
      setCheckingLimit(true);
    });
    checkWorkspaceLimitAction()
      .then(setLimitCheck)
      .catch(() => setLimitCheck(null))
      .finally(() => setCheckingLimit(false));
  }, [open]);

  // When upgrade pricing popup opens, close parent dialog so only one overlay exists
  useEffect(() => {
    if (showUpgrade) {
      onOpenChange(false);
    }
  }, [showUpgrade, onOpenChange]);

  const fetchCurrentPlan = useCallback(async () => {
    try {
      const sub = await getUserSubscriptionAction();
      setCurrentPlan((sub.plan_type as PlanType) || "free");
    } catch {
      setCurrentPlan("free");
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    setLoading(true);
    try {
      const newWorkspace = await createWorkspaceAction(data.name);
      toast.success(`Workspace "${newWorkspace.name}" created successfully!`);
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = (error as Error).message || "";
      if (isLimitError(message)) {
        await fetchCurrentPlan();
        setShowUpgrade(true);
      } else {
        toast.error(message || "Failed to create workspace. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isAtLimit = limitCheck && !limitCheck.allowed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} loading={loading}>
      <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-2xl">
        {isAtLimit ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <DialogTitle className="text-base font-semibold">Workspace Limit Reached</DialogTitle>
              </div>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                You&apos;ve hit the limit for your current plan.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                    <span>Current usage</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {limitCheck.current} / {limitCheck.limit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full"
                    style={{ width: `${Math.min((limitCheck.current / Math.max(limitCheck.limit, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  <Badge variant="secondary" className="uppercase tracking-wide text-[10px] mr-1.5 font-semibold">
                    {limitCheck.planType}
                  </Badge>
                  {limitCheck.planType === "free"
                    ? "Free plan allows 1 workspace. Upgrade to Pro for up to 3 workspaces or Ultra for unlimited."
                    : `Plan allows ${limitCheck.limit} workspaces.`}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
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
                  <FolderPlus className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold">New Workspace</DialogTitle>
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
                  <FolderPlus className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg font-bold">New Workspace</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground text-xs">
                Workspaces organize your boards and collaboration settings.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="workspace-name" className="text-xs font-semibold">
                  Workspace Name
                </Label>
                <Input
                  id="workspace-name"
                  type="text"
                  placeholder="e.g. Acme Corporation, Side Project"
                  className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
                  disabled={loading}
                  maxLength={50}
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-xs font-medium text-destructive px-1">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="h-10 rounded-xl w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 rounded-xl px-4 font-semibold w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>

      {/* Upgrade Dialog shown on plan limit errors */}
      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        currentPlan={currentPlan}
        limitType="workspace"
      />
    </Dialog>
  );
}
