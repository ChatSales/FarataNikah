"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createMonerooCheckout } from "@/lib/payments/moneroo";
import { PREMIUM_MONTHLY_PRICE_FCFA } from "@/lib/premium";

export type CheckoutActionState = { error: string } | null;

export async function createCheckoutAction(
  _prevState: CheckoutActionState
): Promise<CheckoutActionState> {
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
    return { error: "Tu es déjà abonné(e) à Farata Premium." };
  }

  let checkout: Awaited<ReturnType<typeof createMonerooCheckout>>;
  try {
    checkout = await createMonerooCheckout({
      amountFcfa: PREMIUM_MONTHLY_PRICE_FCFA,
      description: "Abonnement Farata Premium — 1 mois",
      customerEmail: profile.email,
      // Onboarding only collects a first name today, so we reuse it — Moneroo
      // requires a non-empty last_name but doesn't otherwise validate it.
      customerFirstName: profile.first_name,
      customerLastName: profile.first_name,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=return`,
      metadata: { profile_id: profile.id },
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
    amount_fcfa: PREMIUM_MONTHLY_PRICE_FCFA,
    status: "pending",
  });
  if (insertError) {
    console.error("Failed to record pending payment_transaction:", insertError);
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }

  redirect(checkout.checkoutUrl);
}
