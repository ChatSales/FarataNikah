import { PlayCircle } from "lucide-react";

export function ProductPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
          Découvrez Farata
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
          Une plateforme pensée pour toi
        </h2>
        <p className="mt-4 text-lg text-primary-900/70">
          2 minutes pour comprendre comment Farata va t&apos;aider à trouver ta
          moitié.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-cream-50 shadow-xl shadow-primary-900/5">
          <div className="flex items-center gap-2 border-b border-primary-100 bg-primary-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary-200" />
            <span className="ml-3 rounded-md bg-cream-50 px-3 py-1 text-xs text-primary-900/50">
              farata.net
            </span>
          </div>
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
            <button
              type="button"
              aria-label="Lire la vidéo de présentation"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-50/90 text-primary-700 shadow-lg transition hover:scale-105"
            >
              <PlayCircle className="h-9 w-9" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
