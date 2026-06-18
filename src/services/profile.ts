import { createClient, createAdminClient } from "@/utils/supabase/server";
import { type Profile, type UpdateProfileInput } from "@/types/profile";

export type { Profile };

/**
 * Fetches the user profile by ID from the public profiles table.
 */
export async function fetchProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Database error in fetchProfileById:", error);
    }
    return null;
  }

  return data;
}

/**
 * Searches for profiles where email starts with or contains the query.
 * Limits the results to 5 for autocomplete.
 */
export async function searchProfilesByEmail(query: string): Promise<Profile[]> {
  if (!query || query.trim().length < 2) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", `%${query.trim()}%`)
    .limit(5);

  if (error) {
    console.error("Database error in searchProfilesByEmail:", error);
    return [];
  }

  return data || [];
}

/**
 * Updates a user's profile information.
 */
export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Database error in updateProfile:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Deletes a user's profile and their auth record.
 */
export async function deleteProfile(userId: string): Promise<void> {
  const adminSupabase = createAdminClient();
  
  // 1. Delete the user from auth.users using the admin API
  // Note: If ON DELETE CASCADE is configured on the profiles table, 
  // this will automatically delete the profile row as well.
  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Database error in deleteProfile (auth):", authError);
    throw new Error(authError.message);
  }

  // 2. Explicitly delete the profile just in case cascade is not enabled
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error("Database error in deleteProfile:", error);
    throw new Error(error.message);
  }
}
