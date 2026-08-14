"use client";

import { useActionState, useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { activateBoostAction } from "@/actions/payments";
import { BoostPurchaseModal } from "@/components/settings/boost-purchase-modal";

function formatRemaining(msLeft: number): string {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function BoostPanel({
  boostCredits,
  boostedUntil,
}: {
  boostCredits: number;
  boostedUntil: string | null;
}) {
  const [state, formAction, pending] = useActionState(activateBoostAction, null);
  const activeUntil =
    state && "success" in state
      ? new Date(Date.now() + 30 * 60 * 1000)
      : boostedUntil
        ? new Date(boostedUntil)
        : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeUntil) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeUntil]);

  const isActive = activeUntil ? activeUntil.getTime() > now : false;
  const remainingCredits = state && "success" in state ? boostCredits - 1 : boostCredits;

  return (
    <div>
      {isActive && activeUntil ? (
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary-900">
            <Rocket className="h-4 w-4 text-gold-500" /> Boost actif — visible en priorité
            encore {formatRemaining(activeUntil.getTime() - now)}
          </p>
          <div className="mt-3">
            <BoostPurchaseModal triggerLabel="Prolonger avec un Boost" />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-primary-900/70">
            {remainingCredits > 0
              ? `${remainingCredits} boost${remainingCredits > 1 ? "s" : ""} disponible${remainingCredits > 1 ? "s" : ""} — mets ton profil en tête de Découvrir pendant 30 minutes.`
              : "Mets ton profil en tête de Découvrir pour une durée déterminée."}
          </p>
          {state && "error" in state && (
            <p className="mt-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {remainingCredits > 0 && (
              <form action={formAction}>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-gold-400 disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {pending ? "Activation..." : "Activer un boost gratuit"}
                </button>
              </form>
            )}
            <BoostPurchaseModal triggerLabel="Acheter un Boost" />
          </div>
        </>
      )}
    </div>
  );
}
