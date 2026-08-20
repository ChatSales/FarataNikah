"use client";

import { useEffect, useState } from "react";
import { Compass, Sparkles, Rocket, Bell, X } from "lucide-react";

const STORAGE_KEY = "farata_tour_seen";

const steps = [
  {
    icon: Compass,
    title: "Découvre des profils compatibles",
    description:
      "Chaque profil est vérifié manuellement. Un score de compatibilité t'aide à repérer les meilleurs matchs.",
  },
  {
    icon: Sparkles,
    title: "Coach Amina, à tout moment",
    description:
      "Une question sur ta bio, tes critères, comment aborder une demande ? Amina est là pour t'accompagner.",
  },
  {
    icon: Rocket,
    title: "Boost ta visibilité",
    description:
      "Mets ton profil en tête de Découvrir pendant une durée choisie, pour recevoir plus de demandes.",
  },
  {
    icon: Bell,
    title: "Reste informé(e)",
    description:
      "Demandes de contact, messages, validation de profil : tout arrive dans tes notifications.",
  },
];

// One-shot welcome tour for first-time visitors — gated client-side via
// localStorage (no DB round-trip needed for something this low-stakes,
// and it deliberately doesn't need to sync across devices).
export function FirstLoginTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      className="animate-fade-up fixed inset-0 z-[60] flex items-center justify-center bg-primary-900/50 px-4"
      style={{ animationDuration: "0.2s" }}
    >
      <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer le tour"
          className="absolute right-4 top-4 text-primary-900/40 hover:text-primary-900"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <current.icon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-primary-900">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
          {current.description}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-primary-600" : "w-1.5 bg-primary-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
          >
            {isLast ? "C'est parti !" : "Suivant"}
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={close}
              className="rounded-full py-2 text-sm font-medium text-primary-900/50 hover:text-primary-900"
            >
              Passer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
