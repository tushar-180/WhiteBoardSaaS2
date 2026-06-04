import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/utils/supabase/server";

export async function proxy(request: NextRequest) {
  const { supabase, response: supabaseResponse } = createMiddlewareClient(request);

  // IMPORTANT: Avoid using getUser() if auth session checks are not necessary for static assets,
  // but since matcher filters them, this is safe and correct.
  const {
      data: { user },
    } = await supabase.auth.getUser();
    

  const url = request.nextUrl.clone();
  
  // Check if the user is trying to access protected routes
  const isProtectedRoute =
    url.pathname.startsWith("/board") ||
    url.pathname.startsWith("/workspaces");

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in, redirect them away from /login
  if (user && url.pathname === "/login") {

    const nextPath = url.searchParams.get("next") || "/";
    // Avoid redirecting back to /login in case of bad parameters to prevent loops
    const targetPath = nextPath.startsWith("/login") ? "/" : nextPath;
    const redirectUrl = new URL(targetPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
