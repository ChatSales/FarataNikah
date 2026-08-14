"use client";

import { useActionState, useState } from "react";
import { Rocket, X, ChevronLeft, Clock, Loader2 } from "lucide-react";
import { createBoostCheckoutAction } from "@/actions/payments";
import { BOOST_TIERS } from "@/lib/boost-pricing";

type Step = "closed" | "promo" | "picker";

export function BoostPurchaseModal({ triggerLabel }: { triggerLabel: string }) {
  const [step, setStep] = useState<Step>("closed");
  const [state, formAction, pending] = useActionState(createBoostCheckoutAction, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setStep("promo")}
        className="flex items-center gap-2 rounded-full border border-gold-400 bg-gold-400/10 px-5 py-2.5 text-sm font-semibold text-gold-700 transition hover:bg-gold-400/20"
      >
        <Rocket className="h-4 w-4" />
        {triggerLabel}
      </button>

      {step === "promo" && (
        <div
          className="animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4"
          style={{ animationDuration: "0.2s" }}
        >
          <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 text-center shadow-xl">
            <button
              type="button"
              onClick={() => setStep("closed")}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-primary-900/40 hover:text-primary-900"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Rocket className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-primary-900">Boostez votre visibilité</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
              Apparaissez en priorité dans les recherches et recevez jusqu&apos;à 10x plus de vues
              sur votre profil.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-primary-700">
              <span className="flex items-center gap-1">📈 10x visibilité</span>
              <span className="flex items-center gap-1">👑 Premium</span>
            </div>

            <button
              type="button"
              onClick={() => setStep("picker")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
            >
              <Rocket className="h-4 w-4" />
              Acheter un Boost
            </button>
            <button
              type="button"
              onClick={() => setStep("closed")}
              className="mt-2 w-full rounded-full py-2.5 text-sm font-medium text-primary-900/60 transition hover:bg-primary-50"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {step === "picker" && (
        <div
          className="animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4"
          style={{ animationDuration: "0.2s" }}
        >
          <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-primary-900">Choisissez votre boost</h2>
              <button
                type="button"
                onClick={() => setStep("closed")}
                aria-label="Fermer"
                className="text-primary-900/40 hover:text-primary-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-2.5">
              {BOOST_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="submit"
                  name="tierId"
                  value={tier.id}
                  disabled={pending}
                  className="flex w-full items-center justify-between rounded-xl border border-primary-100 px-4 py-3.5 text-left transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-60"
                >
                  <span>
                    <span className="block text-sm font-semibold text-primary-900">{tier.label}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-primary-900/50">
                      <Clock className="h-3 w-3" /> {tier.durationLabel}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-bold text-primary-600">
                    {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {tier.priceFcfa.toLocaleString("fr-FR")} F
                  </span>
                </button>
              ))}
            </form>

            {state && "error" in state && (
              <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {state.error}
              </p>
            )}

            <button
              type="button"
              onClick={() => setStep("promo")}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-900/60 hover:text-primary-900"
            >
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
          </div>
        </div>
      )}
    </>
  );
}
