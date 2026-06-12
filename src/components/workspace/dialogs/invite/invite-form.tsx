"use client";

import { Loader2 } from "lucide-react";
import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { type InviteFormData } from "@/types/workspace";
import { type Profile } from "@/types/profile";
import { InviteSuggestions } from "./invite-suggestions";

interface InviteFormProps {
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<InviteFormData>;
  errors: FieldErrors<InviteFormData>;
  loading: boolean;
  searchLoading: boolean;
  suggestions: Profile[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  setSuggestions: (profiles: Profile[]) => void;
  setValue: (name: keyof InviteFormData, value: string) => void;
  trigger: (name: keyof InviteFormData) => void;
  onClose: () => void;
}

export function InviteForm({
  onSubmit,
  register,
  errors,
  loading,
  searchLoading,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  setSuggestions,
  setValue,
  trigger,
  onClose,
}: InviteFormProps) {
  const handleSelectSuggestion = (email: string) => {
    setValue("email", email);
    trigger("email");
    setSuggestions([]);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      {/* Email Input */}
      <div className="space-y-2 relative">
        <Label htmlFor="invite-email" className="text-xs font-semibold">
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="invite-email"
            type="email"
            placeholder="e.g. collaborator@example.com"
            className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background pr-8"
            disabled={loading}
            {...register("email")}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Small delay to allow clicking suggestions before blur hides them
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            autoComplete="off"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <InviteSuggestions
            suggestions={suggestions}
            onSelect={handleSelectSuggestion}
          />
        )}

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
          onClick={onClose}
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
  );
}
