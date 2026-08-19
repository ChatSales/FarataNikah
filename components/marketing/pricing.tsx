import Link from "next/link";
import { Check, X } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { createPublicClient } from "@/lib/supabase/public";
import { getPremiumPlans } from "@/lib/premium";

const freeIncluded = [
  "Création de profil complète",
  "3 photos de profil",
  "5 demandes de contact par jour",
  "3 questions par jour à Coach Amina",
  "Répondre aux messages reçus",
  "Ice Breaker : idées de messages",
  "Accès à l'Académie du Mariage",
  "Support par email",
];

const freeExcluded = [
  "Demandes de contact illimitées",
  "Coach Amina illimité",
  "Voir qui t'a mis en favori",
  "Voir qui a visité ton profil",
  "Messages vocaux",
  "Message Flash personnalisé",
  "Jusqu'à 10 photos HD",
  "Score de compatibilité IA détaillé",
  "Boosts de visibilité",
  "Filtres avancés",
  "Badge Premium vérifié",
];

const premiumIncluded = [
  "Demandes de contact illimitées",
  "Coach Amina : questions illimitées",
  "Voir qui t'a ajouté en favoris ⭐",
  "Voir qui a visité ton profil 👁️",
  "Jusqu'à 10 photos HD sur ton profil",
  "Messagerie 100 % illimitée",
  "Messages vocaux 🎤 NOUVEAU",
  "Vois qui est connecté 🟢",
  "Ice Breaker : idées de messages personnalisées",
  "Message Flash : fais bonne impression",
  "Score de compatibilité IA détaillé",
  "Mieux classé dans les résultats",
  "Filtres avancés (madhhab, niveau de pratique...)",
  "Boosts de profil inclus",
  "Badge Premium vérifié ✓",
  "Support prioritaire 7 j/7",
];

export async function Pricing() {
  const supabase = createPublicClient();
  const plans = await getPremiumPlans(supabase);
  // Assumes the plan flagged "popular" in the admin pricing editor is the
  // monthly one — the copy below ("FCFA / mois") is written around that.
  // Retagging a differently-sized plan as popular would need a copy tweak.
  const featuredPlan = plans.find((p) => p.popular) ?? plans[0];

  return (
    <section id="tarifs" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Tarifs
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
            Commence gratuitement, passe Premium quand tu es prêt(e)
          </h2>
          <p className="mt-4 text-lg text-primary-900/70">
            L&apos;essentiel est accessible gratuitement. Premium débloque des
            fonctionnalités pour aller plus loin dans ta recherche.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 lg:grid-cols-2">
          <Reveal delay={0} className="h-full">
          <div className="h-full rounded-3xl border border-primary-100 bg-cream-50 p-8 transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-lg font-semibold text-primary-900">Gratuit</h3>
            <p className="mt-1 text-sm text-primary-900/60">
              Découvre la plateforme à ton rythme
            </p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-900">0</span>
              <span className="text-primary-900/60">FCFA</span>
            </p>
            <p className="text-sm text-primary-900/50">Pour toujours</p>

            <Link
              href="/signup"
              className="mt-7 block rounded-full border border-primary-300 py-3 text-center text-sm font-semibold text-primary-800 transition hover:bg-primary-50"
            >
              Commencer
            </Link>

            <ul className="mt-8 space-y-3 text-sm">
              {freeIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-primary-900/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  {item}
                </li>
              ))}
              {freeExcluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-primary-900/35">
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          </Reveal>

          <Reveal delay={120} className="h-full">
          <div className="relative h-full rounded-3xl border-2 border-gold-500 bg-primary-900 p-8 text-cream-50 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
            <span className="absolute -top-3.5 left-8 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-primary-900">
              Offre de lancement
            </span>
            <h3 className="text-lg font-semibold">Premium</h3>
            <p className="mt-1 text-sm text-primary-200">
              Pour aller plus loin dans ta recherche
            </p>
            {featuredPlan ? (
              <>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-lg text-primary-300 line-through">
                    {featuredPlan.originalPriceFcfa.toLocaleString("fr-FR")} FCFA
                  </span>
                </p>
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gold-400">
                    {featuredPlan.priceFcfa.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-primary-200">FCFA / mois</span>
                </p>
              </>
            ) : (
              <p className="mt-6 text-sm text-primary-300">Bientôt disponible</p>
            )}

            <Link
              href="/signup?plan=premium"
              className="mt-7 block rounded-full bg-gold-500 py-3 text-center text-sm font-semibold text-primary-900 transition hover:bg-gold-400"
            >
              Commencer
            </Link>

            <ul className="mt-8 space-y-3 text-sm">
              {premiumIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-primary-50/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  {item}
                </li>
              ))}
            </ul>

            {featuredPlan && (
              <p className="mt-6 text-xs text-primary-300">
                * Tarif de lancement limité. Prix normal :{" "}
                {featuredPlan.originalPriceFcfa.toLocaleString("fr-FR")} FCFA / mois
              </p>
            )}
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
