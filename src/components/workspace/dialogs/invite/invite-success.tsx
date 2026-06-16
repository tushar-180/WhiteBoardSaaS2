"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface InviteSuccessProps {
  inviteLink: string;
  emailSent: boolean;
  onClose: () => void;
}

export function InviteSuccess({ inviteLink, emailSent, onClose }: InviteSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Success Box */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {emailSent ? "Invitation Email Sent!" : "Invitation Link Created!"}
        </h4>
        <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
          {emailSent
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
            value={inviteLink}
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
          onClick={onClose}
          className="w-full h-10 rounded-xl font-semibold cursor-pointer"
        >
          Done
        </Button>
      </DialogFooter>
    </div>
  );
}
