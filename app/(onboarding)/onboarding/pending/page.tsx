import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock3, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/actions/auth";

export const metadata: Metadata = { title: "Profil en cours de vérification" };

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status, verification_rejection_reason")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status === "approved") redirect("/app/discover");

  if (profile.verification_status === "rejected") {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-primary-900">
          Ton profil n&apos;a pas été validé
        </h1>
        <p className="mt-2 text-sm text-primary-900/65">
          {profile.verification_rejection_reason ||
            "Notre équipe n'a pas pu valider ton profil en l'état."}
        </p>
        <form action={signOutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-full border border-primary-200 px-5 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Clock3 className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-primary-900">
        Ton profil est en cours de vérification
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
        Notre équipe vérifie manuellement chaque inscription pour garantir des
        profils sérieux et sans faux comptes. Cela prend généralement moins de
        24h. Tu recevras un email dès que ton profil sera validé.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
        En attendant, tu peux déjà parcourir les profils — la messagerie
        s&apos;ouvrira une fois ton profil validé.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/app/discover"
          className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
        >
          Accéder à l&apos;application
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-primary-200 px-5 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
