import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const next = requestUrl.searchParams.get("next") ?? ROUTES.HOME; 
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect to login page with error query param if exchange fails
  const errorRedirectUrl = new URL(ROUTES.LOGIN, request.url);
  errorRedirectUrl.searchParams.set("error", "oauth-failed");
  return NextResponse.redirect(errorRedirectUrl);
}
