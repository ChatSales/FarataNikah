import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const APP_PREFIX = "/app";
const ADMIN_PREFIX = "/admin";
const ONBOARDING_PREFIX = "/onboarding";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith(APP_PREFIX) ||
    pathname.startsWith(ADMIN_PREFIX) ||
    pathname.startsWith(ONBOARDING_PREFIX);

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Gate the main app on verification status. Admin has its own
  // admin_users check inside the (admin) layout (needs a DB round trip
  // that's cheap enough there but wasteful to duplicate on every request).
  if (user && pathname.startsWith(APP_PREFIX)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.redirect(
        new URL("/onboarding/basic-info", request.url)
      );
    }
    if (profile.verification_status !== "approved") {
      return NextResponse.redirect(new URL("/onboarding/pending", request.url));
    }
  }

  return supabaseResponse;
}
