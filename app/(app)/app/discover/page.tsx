import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Sparkles className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold text-primary-900">
        Bienvenue {profile?.first_name}, ton profil est validé !
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-primary-900/65">
        La découverte de profils, les demandes de contact et la messagerie
        arrivent dans la prochaine étape de développement (M2). Ton compte et
        ton profil sont prêts.
      </p>
    </div>
  );
}
