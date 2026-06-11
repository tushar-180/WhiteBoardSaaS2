import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export const port = Number(process.env.PORT) || 8787;
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Sync Server] ❌ Missing Supabase URL or Publishable/Anon Key");
  process.exit(1);
}
