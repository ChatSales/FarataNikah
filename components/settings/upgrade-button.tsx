"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { createCheckoutAction } from "@/actions/payments";

export function UpgradeButton() {
  const [state, formAction, pending] = useActionState(createCheckoutAction, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-primary-900 transition hover:bg-gold-400 disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4" />
        {pending ? "Redirection vers le paiement..." : "Passer Premium — 5 900 FCFA/mois"}
      </button>
      <p className="mt-2 text-xs text-primary-900/50">
        Paiement sécurisé via Moneroo (Orange Money, MTN MoMo, Wave, carte bancaire...).
      </p>
    </form>
  );
}
