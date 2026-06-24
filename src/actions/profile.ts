"use server";

import { revalidatePath } from "next/cache";
import { requireActionAuth, createAdminClient } from "@/utils/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/types/profile";
import { updateProfile, deleteProfile, fetchProfileById } from "@/services/profile";

export async function updateProfileAction(input: UpdateProfileInput) {
  const { user } = await requireActionAuth("You must be logged in to update your profile.");

  const validation = updateProfileSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const updatedProfile = await updateProfile(user.id, validation.data);
  revalidatePath("/", "layout");
  return updatedProfile;
}

export async function uploadAvatarAction(formData: FormData) {
  const { user } = await requireActionAuth("You must be logged in to upload an avatar.");
  
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Use admin client to bypass storage RLS — auth already validated above
  const adminSupabase = createAdminClient();

  // Fetch the old profile to get the old avatar URL
  const oldProfile = await fetchProfileById(user.id);

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await adminSupabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = adminSupabase.storage.from("avatars").getPublicUrl(filePath);

  const updatedProfile = await updateProfile(user.id, { avatar_url: data.publicUrl });

  // Delete the old avatar from storage if it exists
  if (oldProfile?.avatar_url) {
    const urlParts = oldProfile.avatar_url.split('/avatars/');
    if (urlParts.length > 1) {
      const oldFilePath = urlParts[1].split('?')[0];
      // Fire and forget deletion to not block the response
      adminSupabase.storage.from("avatars").remove([oldFilePath]).catch(console.error);
    }
  }

  revalidatePath("/", "layout");
  return updatedProfile;
}

export async function deleteAccountAction(confirmEmail: string) {
  const { user, supabase } = await requireActionAuth("You must be logged in to delete your account.");
  
  if (user.email !== confirmEmail) {
    throw new Error("Email does not match your account email.");
  }
  
  // Note: To completely delete a user from auth.users requires admin API.
  // We'll delete the profile row to clear data, then sign the user out.
  await deleteProfile(user.id);
  
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
}
