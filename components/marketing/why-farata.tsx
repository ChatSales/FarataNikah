import { ShieldOff, HandHeart, EyeOff, Sparkles } from "lucide-react";

const features = [
  {
    icon: ShieldOff,
    title: "Zéro faux profil",
    description:
      "Chaque inscription est vérifiée à la main. Ici, tu parles à de vraies personnes.",
  },
  {
    icon: HandHeart,
    title: "Le halal, sans compromis",
    description:
      "Pas de drague, pas de photos haram. Juste des gens sérieux qui veulent se marier.",
  },
  {
    icon: EyeOff,
    title: "Ta vie privée, notre priorité",
    description:
      "Mode anonyme, photos floues... C'est toi qui décides qui te voit.",
  },
  {
    icon: Sparkles,
    title: "Coach IA personnel",
    description:
      "Cheikh Moussa, ton coach IA, te guide 24 h/24. Conseils personnalisés et Ice Breakers pour bien démarrer.",
  },
];

export function WhyFarata() {
  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            100% halal, 100% sérieux — Pourquoi Farata
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Pas une app de rencontre. Une app de mariage.
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            On a créé ce qu&apos;on aurait aimé trouver&nbsp;: une plateforme
            sérieuse, 100&nbsp;% halal, sans les dérives des autres apps.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-primary-100 bg-cream-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <feature.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-semibold text-primary-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
