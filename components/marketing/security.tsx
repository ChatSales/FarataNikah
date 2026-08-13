import { UserCheck, ScanEye, Lock } from "lucide-react";

const points = [
  {
    icon: UserCheck,
    title: "Vérification manuelle",
    description:
      "Pas de bot, pas de faux profil. Chaque inscription passe par notre équipe avant d'être validée.",
  },
  {
    icon: ScanEye,
    title: "Modération intelligente",
    description:
      "Notre IA scanne chaque message. Contenu inapproprié ? Bloqué instantanément. Pas de place pour la fitna.",
  },
  {
    icon: Lock,
    title: "Contrôle total",
    description:
      "Mode anonyme, photos floues... Tu décides qui voit quoi. Tes données restent les tiennes.",
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
            Ta sécurité n&apos;est pas négociable
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Faux profils, arnaques, haram... On gère tout. Toi, concentre-toi
            sur ta recherche.
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
