"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, X } from "lucide-react";
import { FREE_DAILY_CONTACT_REQUESTS } from "@/lib/usage-limits";

const benefits = [
  { title: "Demandes de contact illimitées", detail: "Plus aucune limite quotidienne." },
  { title: "Mieux classé dans les résultats", detail: "Ton profil se démarque davantage." },
  { title: "Boosts de profil inclus", detail: "Sois visible en priorité dans Découvrir." },
];

// Shown in place of a plain error message the moment a free member hits
// the daily contact-request cap — the highest-intent moment to offer
// Premium, since they were actively trying to reach out when blocked.
// `signal` is the action state object itself (not a derived boolean) so
// the effect re-fires even when the member hits the same limit again on a
// different profile after dismissing — each failed submit produces a new
// object reference from useActionState, even if the shape is identical.
export function ContactLimitModal({ signal }: { signal: unknown }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (signal) setOpen(true);
  }, [signal]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4"
      style={{ animationDuration: "0.2s" }}
    >
      <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-primary-900/40 hover:text-primary-900"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-primary-900">
          <Send className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-primary-900">
          Limite quotidienne atteinte
        </h2>
        <p className="mt-1 text-sm text-primary-900/60">
          Tu as envoyé tes {FREE_DAILY_CONTACT_REQUESTS} demandes gratuites du jour.
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
            href="/app/premium"
            className="flex-1 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-gold-400"
          >
            Passer Premium
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
  );
}
