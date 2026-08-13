import { ShieldOff, HandHeart, EyeOff, Sparkles } from "lucide-react";

const features = [
  {
    icon: ShieldOff,
    title: "Des profils vérifiés",
    description:
      "Chaque nouveau membre est examiné par notre équipe avant d'apparaître sur la plateforme.",
  },
  {
    icon: HandHeart,
    title: "Une intention claire : le mariage",
    description:
      "Pas de drague ni de contenu déplacé — Farata s'adresse à celles et ceux qui cherchent un époux ou une épouse.",
  },
  {
    icon: EyeOff,
    title: "Toi seul(e) décides qui te voit",
    description:
      "Mode anonyme, photos floutées par défaut : tu gardes le contrôle sur ta visibilité.",
  },
  {
    icon: Sparkles,
    title: "Cheikh Moussa, ton accompagnateur",
    description:
      "Un assistant conversationnel disponible à tout moment pour t'aider à préparer tes échanges et poser tes questions.",
  },
];

export function WhyFarata() {
  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Pourquoi Farata
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Une plateforme conçue pour le mariage, pas la rencontre
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Farata a été pensée pour offrir un cadre conforme aux valeurs
            islamiques, loin des codes des applications de rencontre
            classiques.
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
