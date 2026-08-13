import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-shell/app-nav";

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
      <header className="relative border-b border-primary-100 bg-cream-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app/discover" className="flex items-center gap-2 font-semibold text-primary-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-cream-50">
              <HeartHandshake className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg tracking-tight">FarataNikah</span>
          </Link>

          <AppNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
