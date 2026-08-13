import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/app-shell/admin-nav";

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
  if (!adminRow) redirect("/app/home");

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="relative border-b border-primary-100 bg-primary-900 text-cream-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin/verification" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-gold-400" />
            FarataNikah Admin
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
