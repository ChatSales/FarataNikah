import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, Lock, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VisitorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select("id, is_premium")
    .eq("user_id", user.id)
    .single();
  if (!viewer) redirect("/onboarding/basic-info");

  // Count is fetched regardless of plan (a number, no identifying data) so
  // free members see a real teaser instead of a blind paywall — the row-
  // level policy for "incoming" visits is Premium-gated (see migration
  // 0004), so a free member's own RLS-scoped client can't even count
  // these rows; the service-role client is what stands in here, same as
  // any other cross-profile read elsewhere in the app.
  const { count: visitCount } = await createAdminClient()
    .from("profile_visits")
    .select("id", { count: "exact", head: true })
    .eq("visited_profile_id", viewer.id);

  const { data: visits } = viewer.is_premium
    ? await supabase
        .from("profile_visits")
        .select("visitor_profile_id, created_at")
        .eq("visited_profile_id", viewer.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const visitorIds = Array.from(
    new Set((visits ?? []).map((v) => v.visitor_profile_id))
  );

  const { data: profiles } = visitorIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, city, country, is_anonymous")
        .in("id", visitorIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">
        Visiteurs de ton profil
      </h1>

      {!viewer.is_premium ? (
        (visitCount ?? 0) === 0 ? (
          <p className="mt-6 text-sm text-primary-900/50">
            Personne n&apos;a encore visité ton profil.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gold-400 bg-gold-300/10">
            <div className="flex items-center gap-3 p-4">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(visitCount ?? 0, 3) }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-50 bg-primary-200 text-primary-500 blur-[2px]"
                  >
                    <UserRound className="h-4 w-4" />
                  </span>
                ))}
              </div>
              <p className="text-sm text-primary-900">
                <span className="font-semibold">
                  {visitCount} personne{(visitCount ?? 0) > 1 ? "s" : ""}
                </span>{" "}
                {(visitCount ?? 0) > 1 ? "ont" : "a"} visité ton profil.
              </p>
            </div>
            <Link
              href="/app/premium"
              className="flex items-center justify-center gap-2 border-t border-gold-400/40 bg-gold-400/10 py-2.5 text-sm font-semibold text-gold-700 transition hover:bg-gold-400/20"
            >
              <Lock className="h-3.5 w-3.5" /> Découvrir qui, avec Premium
            </Link>
          </div>
        )
      ) : !visits || visits.length === 0 ? (
        <p className="mt-6 text-sm text-primary-900/50">
          Personne n&apos;a encore visité ton profil.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {visits.map((v, i) => {
            const p = profileById.get(v.visitor_profile_id);
            return (
              <li key={`${v.visitor_profile_id}-${i}`}>
                <Link
                  href={`/app/profile/${v.visitor_profile_id}`}
                  className="flex items-center justify-between rounded-xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-300"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-primary-500" />
                    <div>
                      <p className="font-medium text-primary-900">
                        {p?.is_anonymous ? "Profil anonyme" : p?.first_name}
                      </p>
                      <p className="text-xs text-primary-900/50">
                        {p?.city}, {p?.country}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-primary-900/40">
                    {new Date(v.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
