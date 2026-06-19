import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const next = requestUrl.searchParams.get("next") ?? ROUTES.HOME; 

  // If Supabase directly sent an error (like expired link)
  if (errorParam || errorDescription) {
    if (next === ROUTES.RESET_PASSWORD || errorDescription?.toLowerCase().includes("expired")) {
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }
    // Generic error fallback
    const errorRedirectUrl = new URL(ROUTES.LOGIN, request.url);
    errorRedirectUrl.searchParams.set("error", errorDescription || "oauth-failed");
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    } else {
      // Exchange failed (e.g. code is expired or invalid)
      if (next === ROUTES.RESET_PASSWORD) {
        return NextResponse.redirect(new URL("/link-expired", request.url));
      }
    }
  }

  // Redirect to login page with error query param if exchange fails and no code was provided
  const errorRedirectUrl = new URL(ROUTES.LOGIN, request.url);
  errorRedirectUrl.searchParams.set("error", "oauth-failed");
  return NextResponse.redirect(errorRedirectUrl);
}
