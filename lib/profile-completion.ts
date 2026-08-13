export interface CompletionInput {
  bio: string | null;
  profession: string | null;
  education_level: string | null;
  height_cm: number | null;
  nationality: string | null;
  religious_practice_level: string | null;
  seeking_criteria: Record<string, unknown>;
  hasPhoto: boolean;
}

const CHECKS: ((p: CompletionInput) => boolean)[] = [
  (p) => p.hasPhoto,
  (p) => Boolean(p.bio && p.bio.trim().length > 0),
  (p) => Boolean(p.profession && p.profession.trim().length > 0),
  (p) => Boolean(p.education_level && p.education_level.trim().length > 0),
  (p) => p.height_cm !== null,
  (p) => Boolean(p.nationality && p.nationality.trim().length > 0),
  (p) => Boolean(p.religious_practice_level && p.religious_practice_level.trim().length > 0),
  (p) => Object.keys(p.seeking_criteria ?? {}).length > 0,
];

export function computeProfileCompletion(profile: CompletionInput): number {
  const done = CHECKS.filter((check) => check(profile)).length;
  return Math.round((done / CHECKS.length) * 100);
}
