import type { Metadata } from "next";
import { BasicInfoForm } from "@/components/onboarding/basic-info-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tes informations" };

export default async function BasicInfoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadyAcceptedTerms = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("terms_accepted_at")
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyAcceptedTerms = Boolean(profile?.terms_accepted_at);
  }

  return (
    <>
      <h1 className="text-center text-xl font-semibold text-primary-900">
        Parle-nous de toi
      </h1>
      <p className="mt-1.5 text-center text-sm text-primary-900/60">
        Ces informations apparaîtront sur ton profil.
      </p>
      <div className="mt-8">
        <BasicInfoForm alreadyAcceptedTerms={alreadyAcceptedTerms} />
      </div>
    </>
  );
}
