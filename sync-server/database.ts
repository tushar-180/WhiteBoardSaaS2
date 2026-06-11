import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseKey } from "./config";

/**
 * Instantiates an authenticated Supabase client for a user based on their Bearer token.
 */
export function getSupabaseClient(token: string) {
  return createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
