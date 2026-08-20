import { redirect } from "next/navigation";
import { Heart, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TestimonialActions } from "@/components/admin/testimonial-actions";

export default async function AdminTestimonialsPage() {
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

  const { data: pending } = await supabase
    .from("testimonials")
    .select("id, quote, created_at, profile_id")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const profileIds = Array.from(new Set((pending ?? []).map((t) => t.profile_id)));
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, first_name, city, country").in("id", profileIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const { count: approvedCount } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
        <Heart className="h-6 w-6 text-gold-500" /> Témoignages
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-900/60">
        <CheckCircle2 className="h-4 w-4 text-primary-500" /> {approvedCount ?? 0} publié
        {(approvedCount ?? 0) > 1 ? "s" : ""} sur la landing page
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
        En attente de relecture ({pending?.length ?? 0})
      </h2>

      {!pending || pending.length === 0 ? (
        <p className="mt-4 text-sm text-primary-900/50">Aucun témoignage en attente.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {pending.map((t) => {
            const profile = profileById.get(t.profile_id);
            return (
              <li
                key={t.id}
                className="rounded-xl border border-primary-100 bg-cream-50 p-5 transition hover:shadow-sm"
              >
                <p className="text-sm font-semibold text-primary-900">
                  {profile?.first_name ?? "Membre"} · {profile?.city}, {profile?.country}
                </p>
                <p className="mt-2 rounded-lg bg-primary-50 p-3 text-sm italic text-primary-900/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4">
                  <TestimonialActions testimonialId={t.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
