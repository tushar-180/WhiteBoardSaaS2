"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createInviteAction, searchProfilesAction } from "@/actions/invite";
import { inviteSchema, type InviteFormData } from "@/types/workspace";
import { type Profile } from "@/types/profile";
import { InviteForm } from "./invite/invite-form";
import { InviteSuccess } from "./invite/invite-success";

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
  const [inviteResult, setInviteResult] = useState<{
    link: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      toast.error((error as Error).message || "Failed to invite member. Please try again.");
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

  return (
    <Dialog open={open} modal={false} onOpenChange={(val) => {
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
      </DialogContent>
    </Dialog>
  );
}
