import { HeartHandshake, ShieldCheck, Users2 } from "lucide-react";

const commitments = [
  {
    icon: ShieldCheck,
    title: "Un profil, une vraie personne",
    description:
      "Chaque compte est vérifié par notre équipe avant d'être visible par les autres membres.",
  },
  {
    icon: HeartHandshake,
    title: "Une seule intention encouragée",
    description:
      "Farata s'adresse aux personnes qui recherchent sincèrement un mariage conforme à leurs valeurs.",
  },
  {
    icon: Users2,
    title: "Une communauté panafricaine",
    description:
      "Ouvert aux musulmans de tout le continent, quel que soit le pays où tu te trouves.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-primary-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Nos engagements
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Ce que tu peux attendre de Farata
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            Une plateforme jeune, construite avec des règles claires dès le
            premier jour.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {commitments.map((c) => (
            <div
              key={c.title}
              className="flex h-full flex-col rounded-2xl border border-primary-100 bg-cream-50 p-7"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <c.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-semibold text-primary-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-900/65">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
