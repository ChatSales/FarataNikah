"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    q: "Quels modes de paiement sont acceptés ?",
    a: "L'abonnement Premium se paie via Moneroo : mobile money (Orange Money, MTN Mobile Money, Moov Money, Wave, selon disponibilité) ou carte bancaire.",
  },
  {
    q: "Mon paiement est-il sécurisé ?",
    a: "Oui. Le paiement est traité directement par notre prestataire Moneroo — FarataNikah ne collecte ni ne conserve aucune donnée de carte bancaire ou de compte mobile money.",
  },
  {
    q: "Puis-je annuler mon abonnement Premium ?",
    a: "À tout moment depuis Paramètres. L'annulation prend effet à la fin de la période déjà payée, sans reconduction au mois suivant.",
  },
  {
    q: "Comment fonctionne la vérification des profils ?",
    a: "Chaque inscription est examinée manuellement par notre équipe avant d'être visible par les autres membres — généralement en moins de 24h.",
  },
  {
    q: "Mes photos sont-elles visibles par tout le monde ?",
    a: "Non. Par défaut tes photos restent floutées jusqu'à ce que tu acceptes une demande de contact — tu peux ajuster ce réglage à tout moment.",
  },
  {
    q: "Que se passe-t-il si je ne trouve personne pour l'instant ?",
    a: "Ton compte reste actif gratuitement, sans limite de durée. Tu peux continuer à parcourir de nouveaux profils au fil des inscriptions.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
          Questions fréquentes
        </h2>

        <div className="mt-10 space-y-3">
          {questions.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-primary-100 bg-cream-50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-primary-900">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-primary-900/70">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
