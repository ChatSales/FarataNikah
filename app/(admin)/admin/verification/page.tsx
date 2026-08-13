import Link from "next/link";
import { Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminVerificationQueuePage() {
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, first_name, gender, country, city, date_of_birth, created_at")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">
        File de vérification ({pending?.length ?? 0})
      </h1>

      {!pending || pending.length === 0 ? (
        <p className="mt-8 text-sm text-primary-900/60">
          Aucun profil en attente de vérification.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/verification/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-300"
              >
                <div>
                  <p className="font-semibold text-primary-900">
                    {p.first_name} · {p.gender === "male" ? "Homme" : "Femme"}
                  </p>
                  <p className="text-sm text-primary-900/60">
                    {p.city}, {p.country}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-primary-900/50">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
