import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGatedPrimaryPhotoUrl } from "@/lib/connections";
import { computeCompatibilityScore, type ScorableProfile } from "@/lib/matching/score";
import { computeProfileCompletion } from "@/lib/profile-completion";
import { getPremiumPlans } from "@/lib/premium";
import { HomeBanners } from "@/components/home/home-banners";
import { ProfileCompletionCard } from "@/components/home/profile-completion-card";
import { FarataSelection, type SelectionProfile } from "@/components/home/farata-selection";

const SELECTION_LIMIT = 8;

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select(
      "id, first_name, city, country, gender, madhhab, marital_status, date_of_birth, seeking_criteria, is_premium, bio, profession, religious_practice_level, interests, life_goals"
    )
    .eq("user_id", user.id)
    .single();
  if (!viewer) redirect("/onboarding/basic-info");

  const { count: photoCount } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", viewer.id);
  const hasPhoto = (photoCount ?? 0) > 0;

  const ownPhotoUrl = await getGatedPrimaryPhotoUrl(supabase, viewer.id, {
    id: viewer.id,
    blur_photos: false,
  });

  const { percent: completionPercent } = computeProfileCompletion({
    bio: viewer.bio,
    profession: viewer.profession,
    religious_practice_level: viewer.religious_practice_level,
    interests: viewer.interests,
    life_goals: viewer.life_goals,
    seeking_criteria: viewer.seeking_criteria as Record<string, unknown>,
    hasPhoto,
  });

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

  let candidateQuery = supabase
    .from("profiles")
    .select(
      "id, first_name, city, country, madhhab, marital_status, date_of_birth, seeking_criteria, is_anonymous, blur_photos, boosted_until"
    )
    .eq("verification_status", "approved")
    .eq("gender", oppositeGender)
    .neq("id", viewer.id)
    .limit(30);
  if (blockedIds.length > 0) {
    candidateQuery = candidateQuery.not("id", "in", `(${blockedIds.join(",")})`);
  }
  const { data: candidates } = await candidateQuery;

  const { data: myFavorites } = await supabase
    .from("favorites")
    .select("favorited_profile_id")
    .eq("profile_id", viewer.id);
  const favoritedIds = new Set((myFavorites ?? []).map((f) => f.favorited_profile_id));

  const viewerScorable: ScorableProfile = {
    country: viewer.country,
    city: viewer.city,
    madhhab: viewer.madhhab,
    marital_status: viewer.marital_status,
    date_of_birth: viewer.date_of_birth,
    seeking_criteria: viewer.seeking_criteria as ScorableProfile["seeking_criteria"],
  };

  const ranked = (candidates ?? [])
    .map((c) => ({
      candidate: c,
      score: computeCompatibilityScore(viewerScorable, {
        country: c.country,
        city: c.city,
        madhhab: c.madhhab,
        marital_status: c.marital_status,
        date_of_birth: c.date_of_birth,
        seeking_criteria: c.seeking_criteria as ScorableProfile["seeking_criteria"],
      }),
    }))
    .sort((a, b) => {
      const aBoosted = Boolean(a.candidate.boosted_until && new Date(a.candidate.boosted_until) > new Date());
      const bBoosted = Boolean(b.candidate.boosted_until && new Date(b.candidate.boosted_until) > new Date());
      if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, SELECTION_LIMIT);

  const selection: SelectionProfile[] = await Promise.all(
    ranked.map(async ({ candidate: c }) => {
      const photoUrl = await getGatedPrimaryPhotoUrl(supabase, viewer.id, {
        id: c.id,
        blur_photos: c.blur_photos,
      });
      return {
        id: c.id,
        displayName: c.is_anonymous ? "Profil anonyme" : c.first_name,
        age: ageFromDob(c.date_of_birth),
        photoUrl,
        isFavorited: favoritedIds.has(c.id),
      };
    })
  );

  const premiumPlans = await getPremiumPlans(supabase);
  const featuredPlan = premiumPlans.find((p) => p.popular) ?? premiumPlans[0];
  const discountPercent = featuredPlan
    ? Math.round((1 - featuredPlan.priceFcfa / featuredPlan.originalPriceFcfa) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeBanners
        showPhotoBanner={!hasPhoto}
        showPremiumBanner={!viewer.is_premium && Boolean(featuredPlan)}
        premiumDiscountPercent={discountPercent}
      />

      <ProfileCompletionCard
        firstName={viewer.first_name}
        city={viewer.city}
        country={viewer.country}
        photoUrl={ownPhotoUrl}
        completionPercent={completionPercent}
      />

      <FarataSelection profiles={selection} />
    </div>
  );
}
