import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { UserRound, MapPin, GraduationCap, Briefcase, Ruler } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getGatedPrimaryPhotoUrl } from "@/lib/connections";
import { computeCompatibilityScore, type ScorableProfile } from "@/lib/matching/score";
import { ContactRequestPanel } from "@/components/discover/contact-request-panel";
import type { Madhhab, MaritalStatus } from "@/lib/supabase/types";

const madhhabLabels: Record<Madhhab, string> = {
  hanafi: "Hanafite",
  maliki: "Malikite",
  shafii: "Chaféite",
  hanbali: "Hanbalite",
  no_preference: "Madhhab : peu importe",
  other: "Autre madhhab",
};

const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: "Célibataire",
  divorced: "Divorcé(e)",
  widowed: "Veuf/Veuve",
};

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select(
      "id, country, city, madhhab, marital_status, date_of_birth, seeking_criteria"
    )
    .eq("user_id", user.id)
    .single();
  if (!viewer) redirect("/onboarding/basic-info");

  const { data: candidate } = await supabase
    .from("profiles")
    .select(
      "id, first_name, city, country, madhhab, marital_status, date_of_birth, seeking_criteria, is_anonymous, blur_photos, bio, profession, education_level, height_cm, religious_practice_level, verification_status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!candidate || candidate.verification_status !== "approved") notFound();
  if (candidate.id === viewer.id) redirect("/app/discover");

  const photoUrl = await getGatedPrimaryPhotoUrl(supabase, viewer.id, {
    id: candidate.id,
    blur_photos: candidate.blur_photos,
  });

  const { data: existingRequest } = await supabase
    .from("contact_requests")
    .select("id, sender_profile_id, recipient_profile_id, status")
    .or(
      `and(sender_profile_id.eq.${viewer.id},recipient_profile_id.eq.${candidate.id}),and(sender_profile_id.eq.${candidate.id},recipient_profile_id.eq.${viewer.id})`
    )
    .neq("status", "declined")
    .maybeSingle();

  const connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted" =
    !existingRequest
      ? "none"
      : existingRequest.status === "accepted"
        ? "accepted"
        : existingRequest.sender_profile_id === viewer.id
          ? "pending_sent"
          : "pending_received";

  const viewerScorable: ScorableProfile = {
    country: viewer.country,
    city: viewer.city,
    madhhab: viewer.madhhab,
    marital_status: viewer.marital_status,
    date_of_birth: viewer.date_of_birth,
    seeking_criteria: viewer.seeking_criteria as ScorableProfile["seeking_criteria"],
  };
  const score = computeCompatibilityScore(viewerScorable, {
    country: candidate.country,
    city: candidate.city,
    madhhab: candidate.madhhab,
    marital_status: candidate.marital_status,
    date_of_birth: candidate.date_of_birth,
    seeking_criteria: candidate.seeking_criteria as ScorableProfile["seeking_criteria"],
  });

  const displayName = candidate.is_anonymous ? "Profil anonyme" : candidate.first_name;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-cream-50">
        <div className="relative flex aspect-[16/9] items-center justify-center bg-primary-100">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={displayName}
              fill
              sizes="768px"
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-primary-400">
              <UserRound className="h-16 w-16" />
              <span className="text-sm font-medium">Photo floutée</span>
            </div>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-primary-900/80 px-3 py-1 text-sm font-semibold text-cream-50">
            {score}% compatible
          </span>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-semibold text-primary-900">
            {displayName}, {ageFromDob(candidate.date_of_birth)} ans
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-900/60">
            <MapPin className="h-4 w-4" /> {candidate.city}, {candidate.country}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-primary-800">
            <span className="rounded-full bg-primary-100 px-3 py-1">
              {madhhabLabels[candidate.madhhab]}
            </span>
            <span className="rounded-full bg-primary-100 px-3 py-1">
              {maritalStatusLabels[candidate.marital_status]}
            </span>
            {candidate.height_cm && (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1">
                <Ruler className="h-3.5 w-3.5" /> {candidate.height_cm} cm
              </span>
            )}
            {candidate.profession && (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1">
                <Briefcase className="h-3.5 w-3.5" /> {candidate.profession}
              </span>
            )}
            {candidate.education_level && (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1">
                <GraduationCap className="h-3.5 w-3.5" /> {candidate.education_level}
              </span>
            )}
          </div>

          {candidate.bio && (
            <p className="mt-6 text-sm leading-relaxed text-primary-900/80">{candidate.bio}</p>
          )}
          {candidate.religious_practice_level && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-primary-900">Pratique religieuse</h2>
              <p className="mt-1 text-sm leading-relaxed text-primary-900/70">
                {candidate.religious_practice_level}
              </p>
            </div>
          )}

          <div className="mt-8">
            <ContactRequestPanel
              recipientProfileId={candidate.id}
              connectionStatus={connectionStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
