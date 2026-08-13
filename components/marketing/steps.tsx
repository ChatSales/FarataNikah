const steps = [
  {
    number: "01",
    title: "Crée ton profil",
    description:
      "Quelques informations sur toi, tes valeurs et ce que tu recherches pour ton mariage.",
  },
  {
    number: "02",
    title: "Attends la validation",
    description:
      "Notre équipe vérifie ton profil pour garantir un espace fiable à tous les membres.",
  },
  {
    number: "03",
    title: "Parcours des profils compatibles",
    description:
      "Filtre selon tes critères et envoie une demande de contact aux profils qui t'intéressent.",
  },
  {
    number: "04",
    title: "Échange dans le respect",
    description:
      "Une fois la demande acceptée, discute librement, avec l'appui de Coach Amina si besoin.",
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
            Comment fonctionne Farata
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Un parcours clair, du premier profil à la première conversation.
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
