import { createClient } from "@/utils/supabase/server";
import { type Profile } from "@/types/profile";

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
    console.error("Database error in fetchProfileById:", error);
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

