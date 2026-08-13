const testimonials = [
  {
    initial: "A",
    quote:
      "Enfin une plateforme où je me sens respectée. Pas de messages déplacés, que des profils sérieux. Je recommande à toutes les sœurs !",
    name: "Aminata D., 27 ans",
    location: "Dakar, Sénégal",
  },
  {
    initial: "O",
    quote:
      "L'interface est claire, les profils sont vérifiés, et l'équipe répond vite. C'est exactement ce qu'il nous fallait au Sénégal.",
    name: "Ousmane S., 31 ans",
    location: "Thiès, Sénégal",
  },
  {
    initial: "F",
    quote:
      "J'avais peur de m'exposer en ligne. Ici, le mode anonyme me rassure. Je peux chercher sereinement, en toute discrétion.",
    name: "Fatou N., 25 ans",
    location: "Saint-Louis, Sénégal",
  },
];

export function Testimonials() {
  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Ils l&apos;ont fait
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Des histoires qui finissent bien
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Ils ont trouvé leur moitié sur Farata. Et toi&nbsp;?
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-2xl border border-primary-100 bg-cream-50 p-7"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-primary-900/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-cream-50">
                  {t.initial}
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary-900">{t.name}</p>
                  <p className="text-xs text-primary-900/55">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
