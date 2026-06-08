"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.LOGIN);
}
