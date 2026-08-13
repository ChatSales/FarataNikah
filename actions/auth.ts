"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendMetaServerEvent } from "@/lib/meta-capi";

export type AuthActionState = { error: string } | null;

async function requestMeta() {
  const h = await headers();
  return {
    clientIp: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: h.get("user-agent") ?? undefined,
  };
}

// Redirecting straight to /app/discover and letting the proxy middleware
// catch an incomplete/unapproved profile works, but middleware issuing a
// *second* redirect on top of the Server Action's redirect() leaves the
// browser's address bar out of sync with the page that actually rendered
// (a Next.js quirk — the rendered content is correct, only the URL bar
// lags, and it self-heals on the next navigation/refresh). Resolving the
// destination here avoids the double-hop entirely for the common case.
export async function resolvePostLoginPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  fallback: string,
  email?: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    // First time this user has ever reached the app (covers Google's
    // first-login-is-signup flow, not just email signup) — the
    // CompleteRegistration event lives here so both auth methods report it
    // from the same place, deduplicated against the client Pixel call via
    // eventId (components/analytics/meta-pixel-event.tsx reads `eid`).
    const eventId = crypto.randomUUID();
    if (email) {
      const { clientIp, userAgent } = await requestMeta();
      await sendMetaServerEvent({
        eventName: "CompleteRegistration",
        eventId,
        email,
        clientIp,
        userAgent,
      });
    }
    return `/onboarding/basic-info?new=1&eid=${eventId}`;
  }
  if (profile.verification_status !== "approved") return "/onboarding/pending";
  return fallback;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Merci de renseigner un email et un mot de passe." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  // CGU acceptance is recorded once, at onboarding/basic-info — the one
  // mandatory first step shared by both email and Google signup.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: "Impossible de créer le compte : " + error.message };
  }

  const eventId = crypto.randomUUID();
  const { clientIp, userAgent } = await requestMeta();
  await sendMetaServerEvent({
    eventName: "CompleteRegistration",
    eventId,
    email,
    clientIp,
    userAgent,
  });

  redirect(`/onboarding/basic-info?new=1&eid=${eventId}`);
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/app/discover");

  if (!email || !password) {
    return { error: "Merci de renseigner un email et un mot de passe." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect(await resolvePostLoginPath(supabase, data.user.id, redirectTo, data.user.email));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type PasswordResetState = { error: string } | { success: true } | null;

export async function requestPasswordResetAction(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Merci de renseigner ton email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?type=recovery`,
  });

  if (error) {
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }

  return { success: true };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error || !data.user) {
    return { error: "Impossible de mettre à jour le mot de passe." };
  }

  redirect(await resolvePostLoginPath(supabase, data.user.id, "/app/discover", data.user.email));
}
