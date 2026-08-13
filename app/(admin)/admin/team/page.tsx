import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddAdminForm, RemoveAdminButton } from "@/components/admin/admin-team-forms";

export default async function AdminTeamPage() {
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

  const { data: admins } = await supabase
    .from("admin_users")
    .select("id, user_id, role, created_at")
    .order("created_at", { ascending: true });

  const adminUserIds = (admins ?? []).map((a) => a.user_id);
  const adminClient = createAdminClient();
  const { data: profiles } = adminUserIds.length
    ? await adminClient.from("profiles").select("user_id, first_name, email").in("user_id", adminUserIds)
    : { data: [] };
  const profileByUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
        <ShieldCheck className="h-6 w-6 text-gold-500" /> Équipe admin
      </h1>
      <p className="mt-1 text-sm text-primary-900/60">
        Ajoute ou retire un administrateur via son adresse email — la personne doit déjà
        avoir un compte FarataNikah.
      </p>

      <div className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <AddAdminForm />
      </div>

      <ul className="mt-6 space-y-2">
        {(admins ?? []).map((a) => {
          const profile = profileByUserId.get(a.user_id);
          return (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-primary-100 bg-cream-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-primary-900">
                  {profile?.first_name ?? "Profil non créé"}
                  {a.user_id === user.id && (
                    <span className="ml-2 text-xs text-primary-900/40">(toi)</span>
                  )}
                </p>
                <p className="text-xs text-primary-900/50">{profile?.email ?? a.user_id}</p>
              </div>
              <RemoveAdminButton adminUserId={a.user_id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
