import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyMonerooSignature,
  type MonerooWebhookPayload,
} from "@/lib/payments/moneroo";
import { PREMIUM_PERIOD_DAYS, getPremiumPlan } from "@/lib/premium";
import { sendMetaServerEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-moneroo-signature");

  if (!verifyMonerooSignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: MonerooWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const rawPayload = payload as unknown as Record<string, unknown>;

  const supabase = createAdminClient();

  const { data: transaction } = await supabase
    .from("payment_transactions")
    .select("id, profile_id, status, subscription_id, plan_id, amount_fcfa")
    .eq("provider_transaction_id", payload.data.id)
    .maybeSingle();

  if (!transaction) {
    // Unknown transaction (e.g. a Moneroo test ping) — acknowledge so
    // Moneroo doesn't retry, nothing for us to reconcile.
    return NextResponse.json({ received: true, matched: false });
  }

  // Idempotent: webhooks can be retried up to 3 times.
  if (transaction.status === "succeeded") {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  if (payload.event === "payment.success") {
    const plan = transaction.plan_id ? getPremiumPlan(transaction.plan_id) : undefined;
    const periodDays = plan?.days ?? PREMIUM_PERIOD_DAYS;
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + periodDays);

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: transaction.profile_id,
        plan: "premium_monthly",
        status: "active",
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select("id")
      .single();
    if (subError || !subscription) {
      console.error("Failed to create subscription from webhook:", subError);
      return new NextResponse("Internal error", { status: 500 });
    }

    await supabase
      .from("payment_transactions")
      .update({
        status: "succeeded",
        subscription_id: subscription.id,
        raw_payload: rawPayload,
      })
      .eq("id", transaction.id);

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("boost_credits")
      .eq("id", transaction.profile_id)
      .single();

    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_until: periodEnd.toISOString(),
        boost_credits: (currentProfile?.boost_credits ?? 0) + (plan?.boosts ?? 0),
      })
      .eq("id", transaction.profile_id);

    // Only leg of Purchase tracking that fires on an actually confirmed
    // payment — the client Pixel event (app/(app)/app/settings/page.tsx)
    // fires as soon as the browser returns from Moneroo, before this
    // webhook may have run, so it can't tell a real success from a
    // same-URL failure on its own. Shared event_id = transaction.id so
    // Meta de-duplicates the two instead of double-counting.
    const { data: purchaserProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", transaction.profile_id)
      .maybeSingle();
    await sendMetaServerEvent({
      eventName: "Purchase",
      eventId: transaction.id,
      email: purchaserProfile?.email,
      customData: { value: transaction.amount_fcfa, currency: "XOF" },
    });
  } else if (payload.event === "payment.failed" || payload.event === "payment.cancelled") {
    await supabase
      .from("payment_transactions")
      .update({ status: "failed", raw_payload: rawPayload })
      .eq("id", transaction.id);
  } else {
    await supabase
      .from("payment_transactions")
      .update({ raw_payload: rawPayload })
      .eq("id", transaction.id);
  }

  return NextResponse.json({ received: true });
}
