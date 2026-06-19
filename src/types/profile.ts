import { z } from "zod";

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
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  avatar_url?: string;
}

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .optional()
    .or(z.literal("")),
});
