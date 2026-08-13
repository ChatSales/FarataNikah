const steps = [
  {
    number: "01",
    title: "Inscris-toi en 5 minutes",
    description:
      "Pseudo, email, quelques infos. C'est rapide et 100 % gratuit.",
  },
  {
    number: "02",
    title: "Découvre des profils compatibles",
    description:
      "Notre IA analyse tes critères et te propose des personnes qui te correspondent vraiment.",
  },
  {
    number: "03",
    title: "Échange en toute pudeur",
    description:
      "Messages modérés par IA, Ice Breakers pour bien démarrer. Pas de dérive, juste l'essentiel.",
  },
  {
    number: "04",
    title: "Rencontre ta moitié",
    description: "Qu'Allah facilite ta recherche et bénisse ton union. Amine.",
  },
];

export function Steps() {
  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            4 étapes
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            De l&apos;inscription au Nikah
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Simple, rapide, efficace. Ton futur époux ou ta future épouse est
            peut-être à quelques clics.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-4">
          <div className="pointer-events-none absolute top-6 left-0 right-0 hidden h-px bg-primary-200 md:block" />
          {steps.map((step) => (
            <div key={step.number} className="relative text-center md:text-left">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-cream-50 md:mx-0 mx-auto">
                {step.number}
              </span>
              <h3 className="mt-5 font-semibold text-primary-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
