export interface CompletionInput {
  bio: string | null;
  profession: string | null;
  religious_practice_level: string | null;
  interests: string | null;
  life_goals: string | null;
  seeking_criteria: Record<string, unknown>;
  hasPhoto: boolean;
}

export interface CompletionCategories {
  photo: boolean;
  personal: boolean;
  locationProfession: boolean;
  marriageVision: boolean;
  personality: boolean;
  religiousPractice: boolean;
  lifePlans: boolean;
}

export interface CompletionResult {
  percent: number;
  categories: CompletionCategories;
}

function hasSeekingAgeRange(criteria: Record<string, unknown>): boolean {
  const min = (criteria as { min_age?: number | null })?.min_age;
  const max = (criteria as { max_age?: number | null })?.max_age;
  return min != null && max != null;
}

// Mirrors the seven sections shown on Settings > Mon profil — each maps to
// one real (optional) field so the checklist there and this percentage
// never disagree. first_name/date_of_birth/marital_status are mandatory
// since onboarding, so "personal" is always satisfied; it's still listed
// (and still editable) since users occasionally need to correct a typo.
export function computeProfileCompletionCategories(profile: CompletionInput): CompletionCategories {
  return {
    photo: profile.hasPhoto,
    personal: true,
    locationProfession: Boolean(profile.profession && profile.profession.trim().length > 0),
    marriageVision:
      Boolean(profile.bio && profile.bio.trim().length > 0) &&
      hasSeekingAgeRange(profile.seeking_criteria ?? {}),
    personality: Boolean(profile.interests && profile.interests.trim().length > 0),
    religiousPractice: Boolean(
      profile.religious_practice_level && profile.religious_practice_level.trim().length > 0
    ),
    lifePlans: Boolean(profile.life_goals && profile.life_goals.trim().length > 0),
  };
}

export function computeProfileCompletion(profile: CompletionInput): CompletionResult {
  const categories = computeProfileCompletionCategories(profile);
  const values = Object.values(categories);
  const percent = Math.round((values.filter(Boolean).length / values.length) * 100);
  return { percent, categories };
}
