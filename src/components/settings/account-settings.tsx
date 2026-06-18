"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { deleteAccountAction } from "@/actions/profile";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { LogOut, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccountSettings() {
  const { user } = useWorkspaceStore();
  const router = useRouter();
  
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user?.email) return;
    setConfirmDeleteOpen(true);
  };

  const executeDeleteAccount = async () => {
    setConfirmDeleteOpen(false);

    try {
      setIsDeleting(true);
      await deleteAccountAction(confirmEmail);
      
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your account security and sessions.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Session</h3>
          <p className="text-sm text-muted-foreground">Log out from your current session on this device.</p>
          <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            Sign Out
          </Button>
        </div>

        <div className="pt-8">
          <div className="border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden bg-red-50/50 dark:bg-red-950/10 p-6 space-y-4">
            <div className="flex gap-4">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-red-600 text-lg">Delete Account</h3>
                <p className="text-sm text-red-600/80 mt-1">
                  Permanently delete your account and all associated data including workspaces you own.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4 max-w-sm ml-10">
              <label className="text-sm font-medium">Type <span className="font-bold">{user?.email}</span> to confirm</label>
              <Input 
                value={confirmEmail} 
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="focus-visible:ring-red-500 my-2 py-2 px-4"
                placeholder="your.email@example.com"
              />
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount} 
                disabled={confirmEmail !== user?.email || isDeleting}
                className="mt-4"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your workspaces and data."
        confirmText="Delete Account"
        onConfirm={executeDeleteAccount}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
