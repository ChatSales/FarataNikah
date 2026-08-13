// Placeholder legal content — NOT reviewed by a lawyer. Every page must be
// replaced with real legal text before Farata accepts real users or real
// payments — ideally reviewed for OHADA/Senegalese law (company registered
// in Dakar) as well as data-protection rules in the other African markets
// the platform serves.

export interface LegalPage {
  slug: string;
  title: string;
  paragraphs: string[];
}

export const legalPages: Record<string, LegalPage> = {
  reglement: {
    slug: "reglement",
    title: "Règlement",
    paragraphs: [
      "Contenu provisoire — nécessite une révision juridique avant publication.",
      "Cette page décrira les règles d'usage de Farata : conduite attendue entre membres, contenus interdits (drague explicite, photos non conformes, sollicitation hors plateforme avant validation du profil), et les sanctions applicables (avertissement, suspension, bannissement).",
    ],
  },
  confidentialite: {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    paragraphs: [
      "Contenu provisoire — nécessite une révision juridique avant publication.",
      "Cette page décrira les données personnelles collectées (profil, photos, messages, données de paiement), leur finalité, leur durée de conservation, les droits d'accès/rectification/suppression des utilisateurs, et les mesures de sécurité mises en œuvre.",
    ],
  },
  "mentions-legales": {
    slug: "mentions-legales",
    title: "Mentions légales",
    paragraphs: [
      "Contenu provisoire — nécessite une révision juridique avant publication.",
      "Cette page identifiera l'éditeur du site, l'hébergeur, le directeur de publication, et les coordonnées légales de la société exploitant Farata.",
    ],
  },
  cgv: {
    slug: "cgv",
    title: "Conditions Générales de Vente",
    paragraphs: [
      "Contenu provisoire — nécessite une révision juridique avant publication.",
      "Cette page décrira les modalités de l'abonnement Premium : tarifs, durée, modalités de paiement (mobile money, carte), renouvellement, résiliation, droit de rétractation et politique de remboursement.",
    ],
  },
  dpa: {
    slug: "dpa",
    title: "Accord de traitement des données (DPA)",
    paragraphs: [
      "Contenu provisoire — nécessite une révision juridique avant publication.",
      "Cette page décrira les engagements de Farata en tant que responsable de traitement, y compris vis-à-vis de ses sous-traitants (hébergement, paiement, IA), conformément aux exigences de protection des données applicables.",
    ],
  },
};
