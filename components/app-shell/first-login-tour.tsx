"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Compass, Sparkles, Rocket, Bell, X, ChevronLeft } from "lucide-react";

const STORAGE_KEY = "farata_tour_seen";

const steps = [
  {
    icon: Compass,
    title: "Découvre des profils compatibles",
    description:
      "Chaque profil est vérifié manuellement. Un score de compatibilité t'aide à repérer les meilleurs matchs.",
    target: '[data-tour="nav-discover"]',
  },
  {
    icon: Sparkles,
    title: "Coach Amina, à tout moment",
    description:
      "Une question sur ta bio, tes critères, comment aborder une demande ? Amina est là pour t'accompagner.",
    target: '[data-tour="coach-fab"]',
  },
  {
    icon: Rocket,
    title: "Boost ta visibilité",
    description:
      "Mets ton profil en tête de Découvrir pendant une durée choisie, pour recevoir plus de demandes.",
    target: '[data-tour="nav-boost"]',
  },
  {
    icon: Bell,
    title: "Reste informé(e)",
    description:
      "Demandes de contact, messages, validation de profil : tout arrive dans tes notifications.",
    target: '[data-tour="nav-notifications"]',
  },
];

const CARD_WIDTH = 340;
const GAP = 12;
const VIEWPORT_MARGIN = 16;

// Finds the step's target among possibly several matches (e.g. notifications
// has a desktop and a mobile bell) and returns the one actually visible at
// the current breakpoint — the others are `display:none` and report a
// zero-size rect, which we treat the same as "not found".
function measureTarget(selector: string): DOMRect | null {
  const candidates = document.querySelectorAll(selector);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  return null;
}

// One-shot welcome tour for first-time visitors — gated client-side via
// localStorage (no DB round-trip needed for something this low-stakes,
// and it deliberately doesn't need to sync across devices). Each step
// spotlights the real nav element it describes when that element is
// present and visible in the DOM; on layouts where it's tucked away
// (e.g. a closed mobile drawer) it falls back to a plain centered card
// instead of forcing the drawer open.
export function FirstLoginTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const measure = () => setRect(measureTarget(steps[step].target));
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step]);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const cardWidth = Math.min(CARD_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  let cardStyle: CSSProperties;
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeBelow = spaceBelow > 240 || spaceBelow > rect.top;
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.min(
      Math.max(left, VIEWPORT_MARGIN),
      window.innerWidth - cardWidth - VIEWPORT_MARGIN
    );
    cardStyle = placeBelow
      ? { position: "fixed", top: rect.bottom + GAP, left, width: cardWidth }
      : { position: "fixed", bottom: window.innerHeight - rect.top + GAP, left, width: cardWidth };
  } else {
    cardStyle = { position: "fixed", inset: 0, margin: "auto", width: cardWidth, height: "fit-content" };
  }

  return (
    <div className="fixed inset-0 z-[60]">
      {rect ? (
        <>
          <div
            className="animate-fade-up fixed inset-x-0 top-0 bg-primary-900/60"
            style={{ height: Math.max(rect.top - 6, 0), animationDuration: "0.2s" }}
          />
          <div
            className="animate-fade-up fixed inset-x-0 bottom-0 bg-primary-900/60"
            style={{ top: rect.bottom + 6, animationDuration: "0.2s" }}
          />
          <div
            className="animate-fade-up fixed bg-primary-900/60"
            style={{
              top: rect.top - 6,
              left: 0,
              width: Math.max(rect.left - 6, 0),
              height: rect.height + 12,
              animationDuration: "0.2s",
            }}
          />
          <div
            className="animate-fade-up fixed bg-primary-900/60"
            style={{
              top: rect.top - 6,
              left: rect.right + 6,
              right: 0,
              height: rect.height + 12,
              animationDuration: "0.2s",
            }}
          />
          <div
            className="pointer-events-none fixed rounded-xl ring-4 ring-gold-400 transition-all"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
        </>
      ) : (
        <div
          className="animate-fade-up fixed inset-0 bg-primary-900/50"
          style={{ animationDuration: "0.2s" }}
        />
      )}

      <div
        key={step}
        className="animate-scale-in rounded-2xl bg-cream-50 p-6 text-center shadow-xl"
        style={cardStyle}
      >
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
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex flex-1 items-center justify-center gap-1 rounded-full border border-primary-200 px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                <ChevronLeft className="h-4 w-4" /> Précédent
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? close() : setStep((s) => s + 1))}
              className="flex-1 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
            >
              {isLast ? "C'est parti !" : "Suivant"}
            </button>
          </div>
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
