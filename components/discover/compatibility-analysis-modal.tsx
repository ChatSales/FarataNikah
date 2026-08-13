"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Heart,
  UserRound,
  CheckCircle2,
  BookOpen,
  MessageCircleQuestion,
  Lightbulb,
  Users2,
} from "lucide-react";
import {
  getCompatibilityAnalysisAction,
  type CompatibilityAnalysisResult,
} from "@/actions/compatibility";

export function CompatibilityAnalysisModal({
  candidateProfileId,
  candidateName,
  viewerName,
  isPremium,
}: {
  candidateProfileId: string;
  candidateName: string;
  viewerName: string;
  isPremium: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CompatibilityAnalysisResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    if (isPremium && result === null) {
      startTransition(async () => {
        const res = await getCompatibilityAnalysisAction(candidateProfileId);
        setResult(res);
      });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
      >
        <Sparkles className="h-4 w-4 text-gold-500" /> Match IA
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4 py-8">
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-primary-900">
                Analyse de compatibilité
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-primary-900/40 hover:text-primary-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 border-b border-primary-100 bg-primary-50/60 py-5">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-primary-900">{viewerName}</span>
              </div>
              <Heart className="h-5 w-5 text-gold-500" />
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-primary-900">{candidateName}</span>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              {!isPremium ? (
                <div className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-primary-900">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-primary-900">
                    Débloquez l&apos;Analyse IA Premium
                  </h3>
                  <ul className="mt-5 space-y-2.5 text-left">
                    {[
                      "Score de compatibilité détaillé",
                      "Valeurs communes identifiées",
                      "Référence islamique pertinente",
                      "Questions à poser suggérées",
                      "Conseils personnalisés",
                      "Points à discuter ensemble",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-primary-900">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/app/settings"
                    className="mt-6 block rounded-full bg-gold-500 px-5 py-3 text-center text-sm font-semibold text-primary-900 transition hover:bg-gold-400"
                  >
                    Passer Premium
                  </Link>
                  <p className="mt-2 text-xs text-primary-900/50">
                    Accès illimité à l&apos;IA et à toutes les fonctionnalités.
                  </p>
                </div>
              ) : pending || result === null ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Sparkles className="h-6 w-6 animate-pulse text-gold-500" />
                  <p className="text-sm text-primary-900/60">Analyse en cours...</p>
                </div>
              ) : "error" in result ? (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                  {result.error}
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary-700">
                      {result.analysis.score}%
                    </span>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-900/50">
                      compatibilité
                    </p>
                  </div>

                  <section>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <Users2 className="h-4 w-4 text-primary-600" /> Valeurs communes
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {result.analysis.commonValues.map((v) => (
                        <li key={v} className="flex items-start gap-2 text-sm text-primary-900/80">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl bg-gold-50 p-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <BookOpen className="h-4 w-4 text-gold-600" /> Référence
                    </h4>
                    <p className="mt-2 text-sm italic leading-relaxed text-primary-900/80">
                      &ldquo;{result.analysis.reference.text}&rdquo;
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary-900/50">
                      {result.analysis.reference.source}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-primary-900/70">
                      {result.analysis.referenceRelevance}
                    </p>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <MessageCircleQuestion className="h-4 w-4 text-primary-600" /> Questions à
                      poser
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {result.analysis.suggestedQuestions.map((q) => (
                        <li key={q} className="text-sm text-primary-900/80">
                          • {q}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                      <Lightbulb className="h-4 w-4 text-primary-600" /> Conseils
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {result.analysis.advice.map((a) => (
                        <li key={a} className="text-sm text-primary-900/80">
                          • {a}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-sm font-semibold text-primary-900">
                      Points à discuter ensemble
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {result.analysis.discussionPoints.map((d) => (
                        <li key={d} className="text-sm text-primary-900/80">
                          • {d}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
