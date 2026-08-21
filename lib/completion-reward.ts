import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { computeProfileCompletion } from "@/lib/profile-completion";
import { createNotification } from "@/lib/notifications";

type Client = SupabaseClient<Database>;

// Called after any edit that could push a profile to 100% completion
// (profile-details save, photo upload) — grants a one-time free Boost
// credit the first time that happens, then flips completion_reward_claimed
// so it never fires again even if fields are later cleared and refilled.
export async function maybeGrantCompletionReward(
  supabase: Client,
  profileId: string
): Promise<void> {
  const [{ data: profile }, { count: photoCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "bio, profession, religious_practice_level, interests, life_goals, seeking_criteria, boost_credits, completion_reward_claimed"
      )
      .eq("id", profileId)
      .single(),
    supabase
      .from("profile_photos")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
  ]);
  if (!profile || profile.completion_reward_claimed) return;

  const { percent } = computeProfileCompletion({
    bio: profile.bio,
    profession: profile.profession,
    religious_practice_level: profile.religious_practice_level,
    interests: profile.interests,
    life_goals: profile.life_goals,
    seeking_criteria: profile.seeking_criteria as Record<string, unknown>,
    hasPhoto: (photoCount ?? 0) > 0,
  });
  if (percent < 100) return;

  await supabase
    .from("profiles")
    .update({
      boost_credits: profile.boost_credits + 1,
      completion_reward_claimed: true,
    })
    .eq("id", profileId);

  await createNotification({
    profileId,
    type: "completion_reward",
    title: "Profil complété à 100% !",
    body: "Bravo — un boost gratuit vient d'être ajouté à ton compte.",
    link: "/app/premium",
  });
}
