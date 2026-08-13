import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake, Settings } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

// Belt-and-suspenders alongside proxy.ts: redirect() inside a Server Action
// (e.g. signInAction) resolves the target route's RSC payload server-side
// within that same response, which does not re-invoke the proxy/middleware.
// Without this check here, a freshly-logged-in user with no profile yet (or
// a pending/rejected one) can land straight on /app/* pages.
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
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status !== "approved") {
    redirect("/onboarding/pending");
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="border-b border-primary-100 bg-cream-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app/discover" className="flex items-center gap-2 font-semibold text-primary-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-cream-50">
              <HeartHandshake className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg tracking-tight">FarataNikah</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-primary-900/70">
            <Link href="/app/discover" className="transition hover:text-primary-700">
              Découvrir
            </Link>
            <Link href="/app/requests" className="transition hover:text-primary-700">
              Mes demandes
            </Link>
            <Link href="/app/messages" className="transition hover:text-primary-700">
              Messages
            </Link>
            <Link href="/app/favorites" className="transition hover:text-primary-700">
              Favoris
            </Link>
            <Link href="/app/visitors" className="transition hover:text-primary-700">
              Visiteurs
            </Link>
            <Link href="/app/coach" className="transition hover:text-primary-700">
              Coach Amina
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/app/settings"
              aria-label="Paramètres"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
