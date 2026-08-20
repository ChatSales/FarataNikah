"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Story } from "@/content/testimonials";

const AUTOPLAY_MS = 6000;

export function TestimonialsCarousel({ stories }: { stories: Story[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const story = stories[index];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % stories.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  function go(delta: number) {
    setPaused(true);
    setIndex((i) => (i + delta + stories.length) % stories.length);
  }

  function jumpTo(i: number) {
    setPaused(true);
    setIndex(i);
  }

  return (
    <section
      className="bg-cream-50 py-16 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-gold-400/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-gold-600">
            Histoires vraies
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Ils ont trouvé leur moitié
          </h2>
        </div>

        <div className="relative mt-12">
          <div
            key={index}
            className="animate-fade-up rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-cream-50 p-8 shadow-sm sm:p-10"
            style={{ animationDuration: "0.4s" }}
          >
            <Quote className="h-8 w-8 text-gold-400" />
            <p className="mt-4 text-lg leading-relaxed text-primary-900">
              &ldquo;{story.quote}&rdquo;
            </p>
            <p className="mt-6 text-sm font-semibold text-primary-900">
              {story.name} <span className="font-normal text-primary-900/50">• {story.city}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Témoignage précédent"
            className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 rounded-full border border-primary-100 bg-cream-50 p-2 text-primary-700 shadow-md transition hover:scale-110 hover:bg-primary-50 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Témoignage suivant"
            className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 rounded-full border border-primary-100 bg-cream-50 p-2 text-primary-700 shadow-md transition hover:scale-110 hover:bg-primary-50 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {stories.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Voir le témoignage ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-gold-500" : "w-2 bg-primary-200 hover:bg-primary-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
