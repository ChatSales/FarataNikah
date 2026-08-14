"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createMonerooCheckout } from "@/lib/payments/moneroo";
import { getPremiumPlan, BOOST_DURATION_MINUTES } from "@/lib/premium";
import { getBoostTier } from "@/lib/boost-pricing";

export type CheckoutActionState = { error: string } | null;

export async function createCheckoutAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const planId = String(formData.get("planId") ?? "1month");
  const plan = getPremiumPlan(planId);
  if (!plan) return { error: "Offre invalide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, is_premium, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status !== "approved") redirect("/onboarding/pending");
  if (profile.is_premium) {
    return { error: "Tu es déjà abonné(e) à FarataNikah Premium." };
  }

  let checkout: Awaited<ReturnType<typeof createMonerooCheckout>>;
  try {
    checkout = await createMonerooCheckout({
      amountFcfa: plan.priceFcfa,
      description: `Abonnement ${plan.label} — FarataNikah`,
      customerEmail: profile.email,
      // Onboarding only collects a first name today, so we reuse it — Moneroo
      // requires a non-empty last_name but doesn't otherwise validate it.
      customerFirstName: profile.first_name,
      customerLastName: profile.first_name,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=return`,
      metadata: { profile_id: profile.id, plan_id: plan.id },
    });
  } catch (err) {
    console.error("Moneroo checkout creation failed:", err);
    return {
      error:
        "Impossible de démarrer le paiement pour le moment. Réessaie dans un instant.",
    };
  }

  const { error: insertError } = await supabase.from("payment_transactions").insert({
    profile_id: profile.id,
    provider_transaction_id: checkout.transactionId,
    amount_fcfa: plan.priceFcfa,
    plan_id: plan.id,
    status: "pending",
  });
  if (insertError) {
    console.error("Failed to record pending payment_transaction:", insertError);
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }

  redirect(checkout.checkoutUrl);
}

export async function createBoostCheckoutAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const tierId = String(formData.get("tierId") ?? "");
  const tier = getBoostTier(tierId);
  if (!tier) return { error: "Offre invalide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");
  if (profile.verification_status !== "approved") redirect("/onboarding/pending");

  let checkout: Awaited<ReturnType<typeof createMonerooCheckout>>;
  try {
    checkout = await createMonerooCheckout({
      amountFcfa: tier.priceFcfa,
      description: `${tier.label} — FarataNikah`,
      customerEmail: profile.email,
      customerFirstName: profile.first_name,
      customerLastName: profile.first_name,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=return`,
      metadata: { profile_id: profile.id, plan_id: tier.id },
    });
  } catch (err) {
    console.error("Moneroo checkout creation failed:", err);
    return {
      error:
        "Impossible de démarrer le paiement pour le moment. Réessaie dans un instant.",
    };
  }

  const { error: insertError } = await supabase.from("payment_transactions").insert({
    profile_id: profile.id,
    provider_transaction_id: checkout.transactionId,
    amount_fcfa: tier.priceFcfa,
    plan_id: tier.id,
    status: "pending",
  });
  if (insertError) {
    console.error("Failed to record pending payment_transaction:", insertError);
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }

  redirect(checkout.checkoutUrl);
}

export type BoostActionState = { error: string } | { success: true } | null;

export async function activateBoostAction(
  _prevState: BoostActionState
): Promise<BoostActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, boost_credits, boosted_until")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");

  if (profile.boosted_until && new Date(profile.boosted_until) > new Date()) {
    return { error: "Un boost est déjà actif sur ton profil." };
  }
  if (profile.boost_credits <= 0) {
    return { error: "Tu n'as plus de boost disponible. Passe Premium pour en obtenir." };
  }

  const boostedUntil = new Date(Date.now() + BOOST_DURATION_MINUTES * 60 * 1000);
  const { error } = await supabase
    .from("profiles")
    .update({
      boost_credits: profile.boost_credits - 1,
      boosted_until: boostedUntil.toISOString(),
    })
    .eq("id", profile.id);
  if (error) return { error: "Impossible d'activer le boost." };

  revalidatePath("/app/settings");
  return { success: true };
}
