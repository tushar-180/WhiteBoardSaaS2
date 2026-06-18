"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useSettingsStore } from "@/store/settings-store";
import { updateProfileAction, uploadAvatarAction } from "@/actions/profile";
import { UserCircle, Loader2, Camera } from "lucide-react";
import { updateProfileSchema } from "@/types/profile";
import { getOptimizedAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function ProfileSettings() {
  const { user } = useWorkspaceStore();
  const { setIsOpen } = useSettingsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  async function onSubmit(data: z.infer<typeof updateProfileSchema>) {
    try {
      setIsSaving(true);

      let newAvatarUrl = user?.avatar_url;

      // Upload pending avatar if one was selected
      if (pendingAvatarFile) {
        const formData = new FormData();
        formData.append("file", pendingAvatarFile);
        const updatedProfile = await uploadAvatarAction(formData);
        newAvatarUrl = updatedProfile?.avatar_url ?? newAvatarUrl;
      }

      // Update profile name
      await updateProfileAction(data);

      // Update local store (both avatar and name atomically)
      if (user) {
        useWorkspaceStore.setState({
          user: { ...user, name: data.name || user.name, avatar_url: newAvatarUrl },
        });
      }

      // Clean up pending avatar state *after* store is updated
      if (pendingAvatarFile) {
        setPendingAvatarFile(null);
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
        setLocalPreview(null);
      }

      toast.success("Profile updated successfully");
      setIsOpen(false);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous preview
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    // Show local preview only — upload happens on save
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setPendingAvatarFile(file);

    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
  }

  // Clean up object URL when it changes or on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const avatarSrc = localPreview || getOptimizedAvatarUrl(user?.avatar_url, 96);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your public profile information.</p>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative shrink-0">
            <div className={cn(
              "w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center",
              pendingAvatarFile && "ring-2 ring-primary ring-offset-2"
            )}>
              {/* eslint-disable @next/next/no-img-element */}
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  width={96}
                  height={96}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-12 h-12 text-muted-foreground" />
              )}
              {/* eslint-enable @next/next/no-img-element */}
            </div>

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className={cn(
                "absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-md transition-transform cursor-pointer",
                !isSaving && "hover:scale-110"
              )}
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={false}
              className="hidden"
              onChange={handleFileChange}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Profile Image</h3>
            <p className="text-sm text-muted-foreground">Upload a square image. JPG, GIF, or PNG, max 5MB.</p>
            {pendingAvatarFile && (
              <p className="text-xs text-primary font-medium">New image selected — save changes to apply</p>
            )}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Your email is tied to your login provider and cannot be changed here.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Your full name" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSaving || (!form.formState.isDirty && !pendingAvatarFile)}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
