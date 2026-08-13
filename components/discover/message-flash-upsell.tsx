"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, X } from "lucide-react";

const benefits = [
  {
    title: "Présente-toi avant même l'acceptation",
    detail: "Ta demande arrive avec ton message personnalisé.",
  },
  {
    title: "Montre ton sérieux",
    detail: "Un message personnalisé vaut mille demandes vides.",
  },
  {
    title: "Plus de chances d'être accepté",
    detail: "Les profils avec message ont bien plus de succès.",
  },
];

export function MessageFlashUpsell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-full border border-gold-400 bg-gold-400/10 px-4 py-3 text-sm font-semibold text-gold-600 transition hover:bg-gold-400/20"
      >
        <Zap className="h-4 w-4" />
        Message Flash
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 text-center shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-primary-900/40 hover:text-primary-900"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-primary-900">
              <Zap className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-primary-900">
              Le Message Flash <Zap className="inline h-4 w-4 text-gold-500" />
            </h2>
            <p className="mt-1 text-sm text-primary-900/60">
              Fais la différence dès le premier contact.
            </p>

            <ul className="mt-5 space-y-3 text-left">
              {benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>
                    <span className="block text-sm font-medium text-primary-900">{b.title}</span>
                    <span className="block text-xs text-primary-900/55">{b.detail}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Link
                href="/app/settings"
                className="flex-1 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-gold-400"
              >
                Débloquer Premium
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-primary-200 px-5 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
