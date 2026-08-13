import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/app/discover");

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="border-b border-primary-100 bg-primary-900 text-cream-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin/verification" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-gold-400" />
            FarataNikah Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-primary-100">
            <Link href="/admin/verification" className="transition hover:text-gold-300">
              Vérification
            </Link>
            <Link href="/admin/moderation" className="transition hover:text-gold-300">
              Modération
            </Link>
            <Link href="/admin/stats" className="transition hover:text-gold-300">
              Statistiques
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-primary-700 px-4 py-2 text-sm font-medium transition hover:bg-primary-800"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
