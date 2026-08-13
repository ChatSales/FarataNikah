import Link from "next/link";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-cream-50 to-cream-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background:radial-gradient(circle_at_20%_20%,var(--color-primary-200),transparent_45%),radial-gradient(circle_at_85%_10%,var(--color-gold-300),transparent_40%)]" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-cream-50 px-4 py-1.5 text-sm font-medium text-primary-800 shadow-sm">
            <Users className="h-4 w-4 text-primary-600" />
            Pensée pour les musulmans d&apos;Afrique
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary-900 sm:text-5xl lg:text-6xl">
            Le mariage d&apos;abord.{" "}
            <span className="text-primary-600">La rencontre ensuite.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-900/70">
            Farata rassemble des célibataires musulmans sérieux, de tout le
            continent, autour d&apos;un seul objectif&nbsp;: le mariage dans le
            respect des principes de l&apos;islam.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-full bg-primary-600 px-8 py-3.5 text-center text-base font-semibold text-cream-50 shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 sm:w-auto"
            >
              Commencer sur le web
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="rounded-xl border border-primary-200 bg-cream-50 px-4 py-2 text-left text-xs text-primary-900/70 transition hover:border-primary-300"
              >
                <span className="block text-[10px] uppercase tracking-wide text-primary-900/50">
                  Télécharger sur
                </span>
                <span className="font-semibold text-primary-800">l&apos;App Store</span>
              </Link>
              <Link
                href="#"
                className="rounded-xl border border-primary-200 bg-cream-50 px-4 py-2 text-left text-xs text-primary-900/70 transition hover:border-primary-300"
              >
                <span className="block text-[10px] uppercase tracking-wide text-primary-900/50">
                  Disponible sur
                </span>
                <span className="font-semibold text-primary-800">Google Play</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-primary-900/70">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary-600" /> Ouvert à toute l&apos;Afrique
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary-600" /> Profils vérifiés manuellement
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-600" /> Inscription gratuite
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
