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
import { ROUTES } from "@/lib/constants";

export function AccountSettings() {
  const { user } = useWorkspaceStore();
  
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

  const handleSignOutClick = () => {
    setConfirmSignOutOpen(true);
  };

  const executeSignOut = async () => {
    setConfirmSignOutOpen(false);
    try {
      setIsSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = ROUTES.LOGIN;
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
      window.location.href = ROUTES.LOGIN;
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
          <div>
            <h3 className="font-semibold text-lg text-foreground">Session</h3>
            <p className="text-sm text-muted-foreground mt-1">Log out from your current session on this device.</p>
          </div>
          <div className="p-4 border border-border/50 rounded-xl bg-card flex items-center justify-between">
            <div className="text-sm font-medium">Current Session</div>
            <Button variant="outline" onClick={handleSignOutClick} disabled={isSigningOut} className="rounded-lg shadow-sm">
              {isSigningOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2 text-muted-foreground" />}
              Sign Out
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <div className="border border-destructive/20 rounded-xl overflow-hidden bg-destructive/5 p-6 space-y-4">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-destructive/80 mt-1">
                  Permanently delete your account and all associated data, including workspaces you own. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6 sm:ml-8 max-w-sm">
              <label className="text-sm font-medium text-destructive/90">
                Type <span className="font-bold">{user?.email}</span> to confirm
              </label>
              <Input 
                value={confirmEmail} 
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="focus-visible:ring-destructive mt-2 border-destructive/30 bg-background py-2 px-3 h-10 rounded-lg shadow-sm"
                placeholder="your.email@example.com"
              />
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount} 
                disabled={confirmEmail !== user?.email || isDeleting}
                className="mt-2 w-full sm:w-auto rounded-lg shadow-sm"
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

      <ConfirmDialog
        open={confirmSignOutOpen}
        onOpenChange={setConfirmSignOutOpen}
        title="Sign Out"
        description="Are you sure you want to sign out from your current session?"
        confirmText="Sign Out"
        onConfirm={executeSignOut}
        variant="destructive"
        loading={isSigningOut}
      />
    </div>
  );
}
