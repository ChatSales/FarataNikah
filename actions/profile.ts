"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Madhhab } from "@/lib/supabase/types";

export type ProfileActionState = { error: string } | null;

const MIN_AGE_YEARS = 18;

function isAdult(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE_YEARS);
  return dob <= cutoff;
}

const basicInfoSchema = z.object({
  first_name: z.string().trim().min(2, "Prénom trop court"),
  gender: z.enum(["male", "female"]),
  date_of_birth: z.string().refine(isAdult, "Tu dois avoir au moins 18 ans."),
  country: z.string().trim().min(2, "Pays requis"),
  city: z.string().trim().min(2, "Ville requise"),
  nationality: z.string().trim().optional(),
  marital_status: z.enum(["single", "divorced", "widowed"]),
});

export async function saveBasicInfoAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("profiles")
    .select("terms_accepted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Signup (email or Google) never records CGU acceptance itself — this is
  // the one mandatory first step for every new profile, so it's the single
  // enforcement point for both auth methods. Already-accepted members
  // editing this step again aren't re-prompted.
  if (!existing?.terms_accepted_at && formData.get("acceptTerms") !== "on") {
    return {
      error: "Tu dois accepter le règlement et la politique de confidentialité pour continuer.",
    };
  }

  const parsed = basicInfoSchema.safeParse({
    first_name: formData.get("first_name"),
    gender: formData.get("gender"),
    date_of_birth: formData.get("date_of_birth"),
    country: formData.get("country"),
    city: formData.get("city"),
    nationality: formData.get("nationality") || undefined,
    marital_status: formData.get("marital_status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      email: user.email!,
      terms_accepted_at: existing?.terms_accepted_at ?? new Date().toISOString(),
      ...parsed.data,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: "Impossible d'enregistrer ton profil : " + error.message };
  }

  redirect("/onboarding/religious-practice");
}

const religiousPracticeSchema = z.object({
  madhhab: z.enum([
    "hanafi",
    "maliki",
    "shafii",
    "hanbali",
    "no_preference",
    "other",
  ]),
  religious_practice_level: z.string().trim().optional(),
  has_children: z.coerce.boolean(),
  wants_children: z.coerce.boolean().optional(),
  profession: z.string().trim().optional(),
  education_level: z.string().trim().optional(),
  height_cm: z.coerce.number().int().min(120).max(230).optional(),
  bio: z.string().trim().max(1000).optional(),
  seeking_min_age: z.coerce.number().int().min(18).max(100).optional(),
  seeking_max_age: z.coerce.number().int().min(18).max(100).optional(),
});

export async function saveReligiousPracticeAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = religiousPracticeSchema.safeParse({
    madhhab: formData.get("madhhab"),
    religious_practice_level: formData.get("religious_practice_level") || undefined,
    has_children: formData.get("has_children") === "on",
    wants_children:
      formData.get("wants_children") === "" ? undefined : formData.get("wants_children") === "on",
    profession: formData.get("profession") || undefined,
    education_level: formData.get("education_level") || undefined,
    height_cm: formData.get("height_cm") || undefined,
    bio: formData.get("bio") || undefined,
    seeking_min_age: formData.get("seeking_min_age") || undefined,
    seeking_max_age: formData.get("seeking_max_age") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const {
    seeking_min_age,
    seeking_max_age,
    ...profileFields
  } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(profileFields as {
        madhhab: Madhhab;
        religious_practice_level?: string;
        has_children: boolean;
        wants_children?: boolean;
        profession?: string;
        education_level?: string;
        height_cm?: number;
        bio?: string;
      }),
      seeking_criteria: {
        min_age: seeking_min_age ?? null,
        max_age: seeking_max_age ?? null,
      },
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer : " + error.message };
  }

  redirect("/onboarding/photos");
}

export async function addProfilePhotoAction(storagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("Profil introuvable.");

  const { count } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const { error } = await supabase.from("profile_photos").insert({
    profile_id: profile.id,
    storage_path: storagePath,
    position: count ?? 0,
    is_primary: (count ?? 0) === 0,
  });

  if (error) throw new Error(error.message);
}

const privacySchema = z.object({
  is_anonymous: z.coerce.boolean(),
  blur_photos: z.coerce.boolean(),
});

export async function savePrivacyAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = privacySchema.safeParse({
    is_anonymous: formData.get("is_anonymous") === "on",
    blur_photos: formData.get("blur_photos") === "on",
  });
  if (!parsed.success) {
    return { error: "Formulaire invalide." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer : " + error.message };
  }

  redirect("/onboarding/pending");
}

