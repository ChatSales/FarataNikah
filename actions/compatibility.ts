"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  computeCompatibilityAnalysis,
  type CompatibilityAnalysis,
  type CompatibilityInput,
} from "@/lib/claude/compatibility";
import type { Madhhab, MaritalStatus } from "@/lib/supabase/types";

export type CompatibilityAnalysisResult = { analysis: CompatibilityAnalysis } | { error: string };

interface ProfileRow {
  date_of_birth: string;
  city: string;
  country: string;
  madhhab: Madhhab;
  marital_status: MaritalStatus;
  profession: string | null;
  education_level: string | null;
  religious_practice_level: string | null;
  bio: string | null;
  seeking_criteria: { min_age?: number | null; max_age?: number | null } | null;
}

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function toCompatibilityInput(p: ProfileRow): CompatibilityInput {
  return {
    age: ageFromDob(p.date_of_birth),
    city: p.city,
    country: p.country,
    madhhab: p.madhhab,
    maritalStatus: p.marital_status,
    practiceLevel: p.religious_practice_level,
    profession: p.profession,
    educationLevel: p.education_level,
    bio: p.bio,
    seekingMinAge: p.seeking_criteria?.min_age ?? null,
    seekingMaxAge: p.seeking_criteria?.max_age ?? null,
  };
}

const PROFILE_SELECT =
  "id, date_of_birth, city, country, madhhab, marital_status, profession, education_level, religious_practice_level, bio, seeking_criteria";

export async function getCompatibilityAnalysisAction(
  candidateProfileId: string
): Promise<CompatibilityAnalysisResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select(`${PROFILE_SELECT}, is_premium`)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!viewer) redirect("/onboarding/basic-info");
  if (!viewer.is_premium) {
    return { error: "Cette analyse est réservée aux membres Premium." };
  }

  const { data: cached } = await supabase
    .from("compatibility_scores")
    .select("analysis")
    .eq("profile_id", viewer.id)
    .eq("candidate_id", candidateProfileId)
    .maybeSingle();
  if (cached?.analysis) {
    return { analysis: cached.analysis as unknown as CompatibilityAnalysis };
  }

  const { data: candidate } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", candidateProfileId)
    .maybeSingle();
  if (!candidate) return { error: "Profil introuvable." };

  const analysis = await computeCompatibilityAnalysis(
    toCompatibilityInput(viewer),
    toCompatibilityInput(candidate)
  );
  if (!analysis) {
    return { error: "Impossible de générer l'analyse pour le moment. Réessaie plus tard." };
  }

  await supabase.from("compatibility_scores").upsert(
    {
      profile_id: viewer.id,
      candidate_id: candidateProfileId,
      score: analysis.score,
      analysis: analysis as unknown as Record<string, unknown>,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,candidate_id" }
  );

  return { analysis };
}
