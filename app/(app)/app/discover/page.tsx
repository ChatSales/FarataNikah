import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGatedPrimaryPhotoUrl } from "@/lib/connections";
import { computeCompatibilityScore, type ScorableProfile } from "@/lib/matching/score";
import { getAiCompatibilityScores, AI_SCORE_CANDIDATE_LIMIT } from "@/lib/matching/ai-score";
import type { CompatibilityInput } from "@/lib/claude/compatibility";
import { FiltersBar } from "@/components/discover/filters-bar";
import { ProfileCard, type DiscoverProfile } from "@/components/discover/profile-card";
import type { Madhhab } from "@/lib/supabase/types";

const madhhabLabels: Record<Madhhab, string> = {
  hanafi: "Hanafite",
  maliki: "Malikite",
  shafii: "Chaféite",
  hanbali: "Hanbalite",
  no_preference: "Madhhab : peu importe",
  other: "Autre madhhab",
};

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string;
    minAge?: string;
    maxAge?: string;
    madhhab?: string;
    profession?: string;
    education?: string;
    practiceLevel?: string;
    blocked?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select(
      "id, first_name, gender, country, city, madhhab, marital_status, date_of_birth, seeking_criteria, is_premium, profession, education_level, religious_practice_level, bio"
    )
    .eq("user_id", user.id)
    .single();

  if (!viewer) redirect("/onboarding/basic-info");

  const oppositeGender = viewer.gender === "male" ? "female" : "male";

  const { data: blocks } = await supabase
    .from("blocked_profiles")
    .select("blocker_profile_id, blocked_profile_id")
    .or(`blocker_profile_id.eq.${viewer.id},blocked_profile_id.eq.${viewer.id}`);
  const blockedIds = Array.from(
    new Set(
      (blocks ?? []).map((b) =>
        b.blocker_profile_id === viewer.id ? b.blocked_profile_id : b.blocker_profile_id
      )
    )
  );

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, city, country, madhhab, marital_status, date_of_birth, seeking_criteria, is_anonymous, blur_photos, profession, education_level, religious_practice_level, bio, boosted_until"
    )
    .eq("verification_status", "approved")
    .eq("gender", oppositeGender)
    .neq("id", viewer.id)
    .limit(30);

  if (blockedIds.length > 0) query = query.not("id", "in", `(${blockedIds.join(",")})`);
  if (params.country) query = query.eq("country", params.country);
  if (params.minAge) {
    const maxDob = new Date();
    maxDob.setFullYear(maxDob.getFullYear() - Number(params.minAge));
    query = query.lte("date_of_birth", maxDob.toISOString().slice(0, 10));
  }
  if (params.maxAge) {
    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - Number(params.maxAge) - 1);
    query = query.gte("date_of_birth", minDob.toISOString().slice(0, 10));
  }
  if (params.madhhab && viewer.is_premium) {
    query = query.eq("madhhab", params.madhhab as Madhhab);
  }
  if (params.profession && viewer.is_premium) {
    query = query.ilike("profession", `%${params.profession}%`);
  }
  if (params.education && viewer.is_premium) {
    query = query.ilike("education_level", `%${params.education}%`);
  }
  if (params.practiceLevel && viewer.is_premium) {
    query = query.ilike("religious_practice_level", `%${params.practiceLevel}%`);
  }

  const { data: candidates } = await query;

  const { data: myRequests } = await supabase
    .from("contact_requests")
    .select("sender_profile_id, recipient_profile_id, status")
    .or(`sender_profile_id.eq.${viewer.id},recipient_profile_id.eq.${viewer.id}`);

  const statusFor = (candidateId: string): DiscoverProfile["connectionStatus"] => {
    const req = myRequests?.find(
      (r) => r.sender_profile_id === candidateId || r.recipient_profile_id === candidateId
    );
    if (!req) return "none";
    if (req.status === "accepted") return "accepted";
    if (req.status === "declined") return "none";
    return req.sender_profile_id === viewer.id ? "pending_sent" : "pending_received";
  };

  const viewerScorable: ScorableProfile = {
    country: viewer.country,
    city: viewer.city,
    madhhab: viewer.madhhab,
    marital_status: viewer.marital_status,
    date_of_birth: viewer.date_of_birth,
    seeking_criteria: viewer.seeking_criteria as ScorableProfile["seeking_criteria"],
  };

  const seekingCriteria = viewer.seeking_criteria as ScorableProfile["seeking_criteria"];
  const toCompatibilityInput = (p: {
    date_of_birth: string;
    city: string;
    country: string;
    madhhab: Madhhab;
    marital_status: string;
    profession: string | null;
    education_level: string | null;
    religious_practice_level: string | null;
    bio: string | null;
  }): CompatibilityInput => ({
    age: ageFromDob(p.date_of_birth),
    city: p.city,
    country: p.country,
    madhhab: p.madhhab,
    maritalStatus: p.marital_status,
    practiceLevel: p.religious_practice_level,
    profession: p.profession,
    educationLevel: p.education_level,
    bio: p.bio,
    seekingMinAge: seekingCriteria?.min_age ?? null,
    seekingMaxAge: seekingCriteria?.max_age ?? null,
  });

  const withHeuristicScore = (candidates ?? []).map((c) => ({
    candidate: c,
    heuristicScore: computeCompatibilityScore(viewerScorable, {
      country: c.country,
      city: c.city,
      madhhab: c.madhhab,
      marital_status: c.marital_status,
      date_of_birth: c.date_of_birth,
      seeking_criteria: c.seeking_criteria as ScorableProfile["seeking_criteria"],
    }),
  }));
  withHeuristicScore.sort((a, b) => b.heuristicScore - a.heuristicScore);

  // Only the strongest heuristic matches get a live/cached Claude score —
  // scoring all 30 candidates per page load would be too slow and costly.
  const aiScores = await getAiCompatibilityScores(
    supabase,
    viewer.id,
    toCompatibilityInput(viewer),
    withHeuristicScore.slice(0, AI_SCORE_CANDIDATE_LIMIT).map(({ candidate }) => ({
      id: candidate.id,
      input: toCompatibilityInput(candidate),
    }))
  );

  const profiles: DiscoverProfile[] = await Promise.all(
    withHeuristicScore.map(async ({ candidate: c, heuristicScore }) => {
      const photoUrl = await getGatedPrimaryPhotoUrl(supabase, viewer.id, {
        id: c.id,
        blur_photos: c.blur_photos,
      });

      return {
        id: c.id,
        displayName: c.is_anonymous ? "Profil anonyme" : c.first_name,
        age: ageFromDob(c.date_of_birth),
        city: c.city,
        country: c.country,
        madhhabLabel: madhhabLabels[c.madhhab],
        compatibilityScore: aiScores.get(c.id)?.score ?? heuristicScore,
        photoUrl,
        connectionStatus: statusFor(c.id),
        isBoosted: Boolean(c.boosted_until && new Date(c.boosted_until) > new Date()),
      };
    })
  );

  // Boosted profiles pin to the top of Discover for the duration of their
  // boost, then fall back to the usual compatibility ranking.
  profiles.sort((a, b) => {
    if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
    return b.compatibilityScore - a.compatibilityScore;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Découvrir des profils</h1>
      <p className="mt-1 text-sm text-primary-900/60">
        Profils vérifiés, compatibles avec tes critères.
      </p>

      {params.blocked === "1" && (
        <p className="mt-4 rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
          Ce profil a été bloqué. Retrouve tes blocages depuis Paramètres.
        </p>
      )}

      <div className="mt-6">
        <FiltersBar
          isPremium={viewer.is_premium}
          defaultValues={{
            country: params.country,
            minAge: params.minAge,
            maxAge: params.maxAge,
            madhhab: params.madhhab,
            profession: params.profession,
            education: params.education,
            practiceLevel: params.practiceLevel,
          }}
        />
      </div>

      {profiles.length === 0 ? (
        <p className="mt-16 text-center text-sm text-primary-900/60">
          Aucun profil ne correspond à ces critères pour l&apos;instant. Reviens
          bientôt ou élargis tes filtres.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
