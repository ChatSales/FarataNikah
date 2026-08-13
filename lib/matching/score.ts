import type { Madhhab, MaritalStatus } from "@/lib/supabase/types";

// MVP compatibility score: a simple rules-based heuristic (0-100), not an
// AI/ML score. The pricing copy implies an "AI compatibility score" —
// phase 2 can replace this with a real Claude-based scoring call, cached
// per profile pair since it's too slow/costly to run live on every browse.

export interface ScorableProfile {
  country: string;
  city: string;
  madhhab: Madhhab;
  marital_status: MaritalStatus;
  date_of_birth: string;
  seeking_criteria: { min_age?: number | null; max_age?: number | null } | null;
}

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function ageMatchesCriteria(
  age: number,
  criteria: ScorableProfile["seeking_criteria"]
): boolean {
  if (!criteria) return true;
  const { min_age, max_age } = criteria;
  if (min_age != null && age < min_age) return false;
  if (max_age != null && age > max_age) return false;
  return true;
}

export function computeCompatibilityScore(
  viewer: ScorableProfile,
  candidate: ScorableProfile
): number {
  let score = 0;

  // Location — same country is a strong signal, same city stronger still.
  if (viewer.country === candidate.country) {
    score += candidate.city === viewer.city ? 30 : 20;
  }

  // Madhhab — either side having no preference counts as compatible.
  if (
    viewer.madhhab === candidate.madhhab ||
    viewer.madhhab === "no_preference" ||
    candidate.madhhab === "no_preference"
  ) {
    score += 25;
  }

  // Age fit — checked in both directions since "compatible" should mean
  // each party falls within what the other is looking for.
  const viewerAge = ageFromDob(viewer.date_of_birth);
  const candidateAge = ageFromDob(candidate.date_of_birth);
  const viewerFitsCandidate = ageMatchesCriteria(
    viewerAge,
    candidate.seeking_criteria
  );
  const candidateFitsViewer = ageMatchesCriteria(
    candidateAge,
    viewer.seeking_criteria
  );
  if (viewerFitsCandidate) score += 15;
  if (candidateFitsViewer) score += 15;

  // Marital status — same status is the common case; divorced/widowed
  // paired together is also treated as compatible rather than penalized.
  if (
    viewer.marital_status === candidate.marital_status ||
    (viewer.marital_status !== "single" && candidate.marital_status !== "single")
  ) {
    score += 15;
  }

  return Math.min(100, score);
}
