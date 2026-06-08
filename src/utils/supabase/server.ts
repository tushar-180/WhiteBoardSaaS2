import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

export const createMiddlewareClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

/**
 * Retrieves the current user and Supabase server client.
 * Does not redirect or throw errors if unauthenticated.
 */
export const getCurrentUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
};

/**
 * Validates authentication for Server Components (pages).
 * Redirects the user to the specified path (default '/login') if unauthenticated.
 */
export const requireAuth = async (redirectTo = ROUTES.LOGIN) => {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return { supabase, user };
};

/**
 * Validates authentication for Server Actions.
 * Throws an error if the user is unauthenticated.
 */
export const requireActionAuth = async (errorMessage = "You must be logged in.") => {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    throw new Error(errorMessage);
  }
  return { supabase, user };
};
