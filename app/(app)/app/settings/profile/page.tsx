import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/settings/edit-profile-form";
import { PrivacyForm } from "@/components/settings/privacy-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import type { Madhhab } from "@/lib/supabase/types";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, first_name, date_of_birth, marital_status, country, city, nationality, madhhab, religious_practice_level, has_children, wants_children, profession, education_level, height_cm, bio, interests, life_goals, seeking_criteria, is_anonymous, blur_photos"
    )
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { count: photoCount } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const seekingCriteria = profile.seeking_criteria as { min_age?: number | null; max_age?: number | null };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/app/settings"
          aria-label="Retour aux paramètres"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-primary-900">Modifier mon profil</h1>
      </div>

      <Link
        id="photo"
        href="/onboarding/photos"
        className="scroll-mt-20 mt-6 flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-5 transition hover:border-primary-200 hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary-900">Photo de profil</p>
            <p className="text-xs text-primary-900/55">
              {photoCount === 0
                ? "Aucune photo — ajoute-en au moins une"
                : `${photoCount} photo${(photoCount ?? 0) > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-primary-400" />
      </Link>

      <div className="mt-6">
        <EditProfileForm
          defaults={{
            first_name: profile.first_name,
            date_of_birth: profile.date_of_birth,
            marital_status: profile.marital_status,
            country: profile.country,
            city: profile.city,
            nationality: profile.nationality,
            madhhab: profile.madhhab as Madhhab,
            religious_practice_level: profile.religious_practice_level,
            has_children: profile.has_children,
            wants_children: profile.wants_children,
            profession: profile.profession,
            education_level: profile.education_level,
            height_cm: profile.height_cm,
            bio: profile.bio,
            interests: profile.interests,
            life_goals: profile.life_goals,
            seeking_min_age: seekingCriteria?.min_age ?? null,
            seeking_max_age: seekingCriteria?.max_age ?? null,
          }}
        />
      </div>

      <div className="mt-6 space-y-6">
        <PrivacyForm defaults={{ is_anonymous: profile.is_anonymous, blur_photos: profile.blur_photos }} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
