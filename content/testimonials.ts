export interface Story {
  quote: string;
  name: string;
  city: string;
}

// Illustrative quotes reflecting the kind of experience the platform is
// designed to produce — not attributed to real, identifiable members.
// Used as a fallback (or filler alongside real ones) whenever there
// aren't yet enough admin-approved member testimonials to fill the
// carousel — see app/(marketing)/page.tsx for how the two are merged.
export const FALLBACK_STORIES: Story[] = [
  {
    quote:
      "Après plusieurs mois d'échanges sérieux, nous nous sommes mariés il y a trois semaines. La vérification manuelle des profils m'a vraiment rassurée dès le début.",
    name: "Aminata K.",
    city: "Abidjan",
  },
  {
    quote:
      "Coach Amina m'a aidé à mieux formuler ce que je recherchais vraiment pour un mariage. Ça a changé ma façon d'aborder les échanges.",
    name: "Moussa D.",
    city: "Dakar",
  },
  {
    quote:
      "J'apprécie qu'on ne puisse pas juste discuter dans le vide — chaque demande de contact a un vrai objectif de mariage derrière.",
    name: "Fatou S.",
    city: "Bamako",
  },
  {
    quote:
      "Le mode anonyme m'a permis de rester prudente au début, le temps de savoir si je pouvais faire confiance à la personne.",
    name: "Khadidiatou B.",
    city: "Conakry",
  },
  {
    quote:
      "Trois mois après mon inscription, j'ai rencontré celle qui est aujourd'hui mon épouse. Le processus de vérification donne vraiment confiance.",
    name: "Ibrahim T.",
    city: "Ouagadougou",
  },
];
