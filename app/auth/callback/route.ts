import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePostLoginPath } from "@/actions/auth";

// Handles Supabase's OAuth (PKCE) redirect for Google sign-in/sign-up:
// /auth/callback?code=... — distinct from /auth/confirm, which handles the
// token_hash links Supabase emails for password/email flows.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const next = await resolvePostLoginPath(
        supabase,
        data.user.id,
        "/app/discover",
        data.user.email
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=lien_invalide`);
}
