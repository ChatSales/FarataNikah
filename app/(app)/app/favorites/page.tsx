import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function FavoritesPage() {
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

  const { data: myFavorites } = await supabase
    .from("favorites")
    .select("favorited_profile_id, created_at")
    .eq("profile_id", viewer.id)
    .order("created_at", { ascending: false });

  const { data: incoming } = viewer.is_premium
    ? await supabase
        .from("favorites")
        .select("profile_id, created_at")
        .eq("favorited_profile_id", viewer.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const allIds = Array.from(
    new Set([
      ...(myFavorites ?? []).map((f) => f.favorited_profile_id),
      ...(incoming ?? []).map((f) => f.profile_id),
    ])
  );

  const { data: profiles } = allIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, city, country, is_anonymous")
        .in("id", allIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Favoris</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Mes favoris ({myFavorites?.length ?? 0})
        </h2>
        {!myFavorites || myFavorites.length === 0 ? (
          <p className="mt-3 text-sm text-primary-900/50">
            Tu n&apos;as encore ajouté personne à tes favoris.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {myFavorites.map((f) => {
              const p = profileById.get(f.favorited_profile_id);
              return (
                <li key={f.favorited_profile_id}>
                  <Link
                    href={`/app/profile/${f.favorited_profile_id}`}
                    className="flex items-center gap-3 rounded-xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-300"
                  >
                    <Heart className="h-4 w-4 shrink-0 fill-gold-500 text-gold-500" />
                    <div>
                      <p className="font-medium text-primary-900">
                        {p?.is_anonymous ? "Profil anonyme" : p?.first_name}
                      </p>
                      <p className="text-xs text-primary-900/50">
                        {p?.city}, {p?.country}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Qui t&apos;a ajouté en favori
        </h2>

        {!viewer.is_premium ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold-400 bg-gold-300/10 p-4">
            <Lock className="h-5 w-5 shrink-0 text-gold-600" />
            <p className="text-sm text-primary-900/70">
              Fonctionnalité réservée aux membres Premium.{" "}
              <Link href="/app/settings" className="font-semibold text-gold-600 underline">
                Découvrir Premium
              </Link>
            </p>
          </div>
        ) : !incoming || incoming.length === 0 ? (
          <p className="mt-3 text-sm text-primary-900/50">
            Personne ne t&apos;a encore ajouté en favori.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {incoming.map((f) => {
              const p = profileById.get(f.profile_id);
              return (
                <li key={f.profile_id}>
                  <Link
                    href={`/app/profile/${f.profile_id}`}
                    className="flex items-center gap-3 rounded-xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-300"
                  >
                    <Heart className="h-4 w-4 shrink-0 text-gold-500" />
                    <div>
                      <p className="font-medium text-primary-900">
                        {p?.is_anonymous ? "Profil anonyme" : p?.first_name}
                      </p>
                      <p className="text-xs text-primary-900/50">
                        {p?.city}, {p?.country}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
