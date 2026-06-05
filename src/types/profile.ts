/**
 * Represents a user's public profile stored in the `profiles` table.
 */
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Minimal user profile slice used in the global Zustand store.
 */
export interface UserProfile {
  email: string;
  name: string;
}
