"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { updateProfileAction, uploadAvatarAction } from "@/actions/profile";
import { UserCircle, Loader2, Camera } from "lucide-react";
import { updateProfileSchema } from "@/types/profile";
import { cn } from "@/lib/utils";

export function ProfileSettings() {
  const { user } = useWorkspaceStore();
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  async function onSubmit(data: z.infer<typeof updateProfileSchema>) {
    try {
      await updateProfileAction(data);
      if (user) {
        useWorkspaceStore.setState({
          user: { ...user, name: data.name || user.name },
        });
      }
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const updatedProfile = await uploadAvatarAction(formData);
      if (user && updatedProfile) {
        useWorkspaceStore.setState({
          user: { ...user, avatar_url: updatedProfile.avatar_url },
        });
      }
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      toast.error(error.message);
      setLocalPreview(null); // revert preview on failure
    } finally {
      setIsUploading(false);
    }
  }

  const avatarSrc = localPreview || user?.avatar_url;

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
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className={cn("w-full h-full object-cover transition-opacity", isUploading && "opacity-50")}
                />
              ) : (
                <UserCircle className={cn("w-12 h-12 text-muted-foreground", isUploading && "opacity-50")} />
              )}
            </div>

            {/* Upload button / spinner overlay */}
            <button
              type="button"
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-md transition-transform cursor-pointer",
                !isUploading && "hover:scale-110"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            
            <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple={false}
  className="hidden"
  onChange={handleFileChange}
  disabled={isUploading}
/>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Profile Image</h3>
            <p className="text-sm text-muted-foreground">Upload a square image. JPG, GIF, or PNG, max 5MB.</p>
            {isUploading && (
              <p className="text-xs text-primary font-medium animate-pulse">Uploading…</p>
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
