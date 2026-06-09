"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Copy, Check } from "lucide-react";
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
import { createInviteAction } from "@/actions/invite";


const inviteSchema = z.object({
  email: z.email("Please enter a valid email address."),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    link: string;
    emailSent: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "editor",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    setInviteResult(null);
    try {
      const result = await createInviteAction(workspaceId, data.email, data.role);
      
      setInviteResult({
        link: result.inviteLink,
        emailSent: result.emailSent,
      });

      if (result.emailSent) {
        toast.success(`Invitation email sent to ${data.email}!`);
      } else {
        toast.success(`Magic invite link created successfully!`);
      }

      reset();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to invite member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult.link);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    reset();
    setInviteResult(null);
    onOpenChange(false);
    // Refresh page data
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="e.g. collaborator@example.com"
                className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
                disabled={loading}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-xs font-medium text-destructive px-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Role Select Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="invite-role" className="text-xs font-semibold">
                Workspace Role
              </Label>
              <div className="relative">
                <select
                  id="invite-role"
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 hover:bg-background/80 focus:bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                  disabled={loading}
                  {...register("role")}
                >
                  <option value="viewer">Viewer (Can only view boards)</option>
                  <option value="editor">Editor (Can draw and manage boards)</option>
                  <option value="admin">Administrator (Can manage settings, boards, and members)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              {errors.role && (
                <span className="text-xs font-medium text-destructive px-1">
                  {errors.role.message}
                </span>
              )}
            </div>

            <DialogFooter className="sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl px-4 font-semibold cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  "Create Invite & Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Success Box */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {inviteResult.emailSent
                  ? "Invitation Email Sent!"
                  : "Invite Created Successfully!"}
              </h4>
              <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
                {inviteResult.emailSent
                  ? "The recipient will receive an email shortly. You can also copy and share this direct magic link with them:"
                  : "No email API key config was found, but the invite is active. Share this magic link with the user to let them join directly:"}
              </p>
            </div>

            {/* Copy Link Input Group */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Magic Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteResult.link}
                  className="h-10 font-mono text-xs bg-muted/50 rounded-xl cursor-default"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-10 w-10 shrink-0 rounded-xl cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={handleClose}
                className="w-full h-10 rounded-xl font-semibold cursor-pointer"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
