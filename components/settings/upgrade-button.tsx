"use client";

import { useActionState, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { createCheckoutAction } from "@/actions/payments";
import { PREMIUM_PLANS } from "@/lib/premium";

function discountPercent(plan: (typeof PREMIUM_PLANS)[number]): number {
  return Math.round((1 - plan.priceFcfa / plan.originalPriceFcfa) * 100);
}

export function UpgradeButton() {
  const [state, formAction, pending] = useActionState(createCheckoutAction, null);
  const [planId, setPlanId] = useState(
    PREMIUM_PLANS.find((p) => p.popular)?.id ?? PREMIUM_PLANS[0].id
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="planId" value={planId} />

      <div className="space-y-2.5">
        {PREMIUM_PLANS.map((plan) => {
          const selected = plan.id === planId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setPlanId(plan.id)}
              className={`relative flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-gold-400 bg-gold-400/10 ring-1 ring-gold-400"
                  : "border-primary-100 hover:border-primary-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-900">
                  Populaire
                </span>
              )}
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                  {plan.label}
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                    -{discountPercent(plan)}%
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-gold-600">
                  <Zap className="h-3 w-3" /> +{plan.boosts} boost{plan.boosts > 1 ? "s" : ""}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-xs text-primary-900/40 line-through">
                  {plan.originalPriceFcfa.toLocaleString("fr-FR")} FCFA
                </span>
                <span className="block text-base font-bold text-primary-900">
                  {plan.priceFcfa.toLocaleString("fr-FR")} FCFA
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-primary-900 transition hover:bg-gold-400 disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4" />
        {pending ? "Redirection vers le paiement..." : "Passer Premium"}
      </button>
      <p className="text-xs text-primary-900/50">
        Paiement sécurisé via Moneroo (Orange Money, MTN MoMo, Wave, carte bancaire...).
      </p>
    </form>
  );
}
