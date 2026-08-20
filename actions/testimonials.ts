"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type TestimonialActionState = { error: string } | { success: true } | null;

const testimonialSchema = z.object({
  quote: z.string().trim().min(20, "Un peu plus de détails nous aiderait (20 caractères minimum).").max(600),
});

export async function submitTestimonialAction(
  _prevState: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
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

  const parsed = testimonialSchema.safeParse({ quote: formData.get("quote") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { count: pendingCount } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("status", "pending_review");
  if ((pendingCount ?? 0) > 0) {
    return { error: "Tu as déjà un témoignage en attente de relecture." };
  }

  const { error } = await supabase.from("testimonials").insert({
    profile_id: profile.id,
    quote: parsed.data.quote,
  });
  if (error) return { error: "Impossible d'envoyer ton témoignage." };

  revalidatePath("/app/settings/testimonial");
  return { success: true };
}
