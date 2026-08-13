import { UserCheck, ScanEye, Lock } from "lucide-react";

const points = [
  {
    icon: UserCheck,
    title: "Vérification manuelle",
    description:
      "Chaque inscription est examinée par notre équipe avant validation, pour limiter les faux comptes.",
  },
  {
    icon: ScanEye,
    title: "Messagerie surveillée",
    description:
      "Les échanges sont analysés automatiquement afin de repérer les contenus contraires à l'esprit de la plateforme.",
  },
  {
    icon: Lock,
    title: "Tes données, tes règles",
    description:
      "Mode anonyme, photos floutées, visibilité paramétrable : tu choisis ce que les autres membres peuvent voir.",
  },
];

export function Security() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Sécurité
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Un cadre sûr pour chercher sereinement
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            On s&apos;occupe des faux profils et des comportements
            inappropriés, pour que tu puisses te concentrer sur ta recherche.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-primary-100 bg-cream-50 p-7"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-cream-50">
                <point.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-primary-900">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
