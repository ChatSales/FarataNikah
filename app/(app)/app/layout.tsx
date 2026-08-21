import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-shell/app-nav";
import { CoachFab } from "@/components/app-shell/coach-fab";
import { FirstLoginTour } from "@/components/app-shell/first-login-tour";

// Belt-and-suspenders alongside proxy.ts: redirect() inside a Server Action
// (e.g. signInAction) resolves the target route's RSC payload server-side
// within that same response, which does not re-invoke the proxy/middleware.
// Without this check here, a freshly-logged-in user with no profile yet (or
// a rejected one) can land straight on /app/* pages.
//
// Pending profiles ARE allowed in here — they can browse, but messaging
// itself is gated separately (app/(app)/app/messages/* + actions/messages.ts)
// until verification_status flips to "approved".
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, verification_status, last_active_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status === "rejected") {
    redirect("/onboarding/pending");
  }
  const isPending = profile.verification_status === "pending";

  // Throttled to once/hour so this doesn't add a write to every single
  // page load — last_active_at only needs to be roughly current for the
  // win-back cron's 14-day inactivity window, not to-the-second accurate.
  if (Date.now() - new Date(profile.last_active_at).getTime() > 60 * 60 * 1000) {
    await supabase
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", profile.id);
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = Boolean(adminRow);

  const { count: unreadNotificationCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="sticky top-0 z-50 border-b border-primary-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app/home" className="flex items-center gap-2 font-semibold text-primary-800">
            <Image src="/farata-icon.png" alt="" width={36} height={36} className="h-8 w-8" priority />
            <span className="text-lg tracking-tight">FarataNikah</span>
          </Link>

          <AppNav isAdmin={isAdmin} unreadNotificationCount={unreadNotificationCount ?? 0} />
        </div>
      </header>
      {isPending && (
        <div className="flex items-center justify-center gap-2 bg-gold-400/20 px-4 py-2 text-center text-xs font-medium text-primary-900">
          <Clock3 className="h-3.5 w-3.5 shrink-0" />
          Ton profil est en cours de vérification — tu peux parcourir les
          profils, mais la messagerie s&apos;ouvrira une fois ton profil validé.
        </div>
      )}
      <main className="flex-1">{children}</main>
      <CoachFab />
      <FirstLoginTour />
    </div>
  );
}
