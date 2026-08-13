import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RespondRequestButtons } from "@/components/discover/respond-request-buttons";

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  declined: "Refusée",
};

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!viewer) redirect("/onboarding/basic-info");

  const { data: requests } = await supabase
    .from("contact_requests")
    .select("id, sender_profile_id, recipient_profile_id, status, message, created_at")
    .or(`sender_profile_id.eq.${viewer.id},recipient_profile_id.eq.${viewer.id}`)
    .order("created_at", { ascending: false });

  const otherProfileIds = Array.from(
    new Set(
      (requests ?? []).map((r) =>
        r.sender_profile_id === viewer.id ? r.recipient_profile_id : r.sender_profile_id
      )
    )
  );

  const { data: otherProfiles } = otherProfileIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, city, country, date_of_birth, is_anonymous")
        .in("id", otherProfileIds)
    : { data: [] };

  const profileById = new Map((otherProfiles ?? []).map((p) => [p.id, p]));

  const received = (requests ?? []).filter(
    (r) => r.recipient_profile_id === viewer.id && r.status === "pending"
  );
  const sent = (requests ?? []).filter((r) => r.sender_profile_id === viewer.id);
  const accepted = (requests ?? []).filter((r) => r.status === "accepted");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Mes demandes</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Reçues ({received.length})
        </h2>
        {received.length === 0 ? (
          <p className="mt-3 text-sm text-primary-900/50">Aucune demande en attente.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {received.map((r) => {
              const other = profileById.get(r.sender_profile_id);
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-primary-100 bg-cream-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/app/profile/${r.sender_profile_id}`}
                        className="font-semibold text-primary-900 hover:underline"
                      >
                        {other?.is_anonymous ? "Profil anonyme" : other?.first_name}
                        {other ? `, ${ageFromDob(other.date_of_birth)} ans` : ""}
                      </Link>
                      <p className="text-xs text-primary-900/55">
                        {other?.city}, {other?.country}
                      </p>
                      {r.message && (
                        <p className="mt-2 text-sm text-primary-900/75">&ldquo;{r.message}&rdquo;</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <RespondRequestButtons requestId={r.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Envoyées ({sent.length})
        </h2>
        {sent.length === 0 ? (
          <p className="mt-3 text-sm text-primary-900/50">Tu n&apos;as envoyé aucune demande.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sent.map((r) => {
              const other = profileById.get(r.recipient_profile_id);
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-primary-100 bg-cream-50 p-4"
                >
                  <Link
                    href={`/app/profile/${r.recipient_profile_id}`}
                    className="font-semibold text-primary-900 hover:underline"
                  >
                    {other?.is_anonymous ? "Profil anonyme" : other?.first_name}
                  </Link>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                    {statusLabels[r.status]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {accepted.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            Connexions ({accepted.length})
          </h2>
          <p className="mt-2 text-sm text-primary-900/60">
            La messagerie arrive dans la prochaine étape de développement. Vos
            demandes acceptées sont bien enregistrées.
          </p>
        </section>
      )}
    </div>
  );
}
