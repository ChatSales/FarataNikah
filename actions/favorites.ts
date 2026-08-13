"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  const favoritedProfileId = String(formData.get("favoritedProfileId") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("favorited_profile_id", favoritedProfileId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({
      profile_id: profile.id,
      favorited_profile_id: favoritedProfileId,
    });
  }

  revalidatePath("/app/favorites");
  revalidatePath(`/app/profile/${favoritedProfileId}`);
  revalidatePath("/app/discover");
}
