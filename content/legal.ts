export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  slug: string;
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const legalPages: Record<string, LegalPage> = {
  reglement: {
    slug: "reglement",
    title: "Règlement",
    updatedAt: "13 août 2026",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "Le présent règlement fixe les règles de conduite applicables à tous les membres de FarataNikah, plateforme de mise en relation en vue du mariage destinée aux musulmans d'Afrique. Il complète les Conditions Générales de Vente et la Politique de confidentialité. En créant un compte, chaque membre s'engage à le respecter.",
        ],
      },
      {
        heading: "2. Conditions d'inscription",
        paragraphs: [
          "L'inscription est réservée aux personnes majeures (18 ans révolus), célibataires, divorcées ou veuves, sincèrement engagées dans une recherche de mariage conforme aux principes de l'islam. Chaque personne ne peut détenir qu'un seul compte. Les informations fournies lors de l'inscription doivent être exactes ; toute usurpation d'identité ou fausse déclaration entraîne la suspension immédiate du compte.",
        ],
      },
      {
        heading: "3. Vérification des profils",
        paragraphs: [
          "Chaque nouveau profil est examiné manuellement par l'équipe de FarataNikah avant d'être visible par les autres membres. FarataNikah se réserve le droit de refuser ou de suspendre tout profil qui ne respecterait pas les critères d'inscription ou le présent règlement, sans obligation de justifier sa décision au-delà du motif communiqué au membre concerné.",
        ],
      },
      {
        heading: "4. Règles de conduite",
        paragraphs: [
          "Les échanges entre membres doivent rester respectueux et conformes à l'objectif de la plateforme : la préparation d'un mariage. Sont notamment interdits : tout contenu à caractère sexuel, suggestif ou dénudé ; toute forme de drague, de flirt ou de propos déplacés ; le harcèlement, l'insistance après un refus, ou la pression psychologique ; l'usurpation d'identité ou la création de faux profils ; la sollicitation commerciale, la mendicité numérique ou toute tentative d'escroquerie ; et la tentative d'échanger des coordonnées personnelles de façon précoce ou insistante avant l'établissement d'une relation de confiance.",
        ],
      },
      {
        heading: "5. Modération et sanctions",
        paragraphs: [
          "Les messages échangés sur la plateforme font l'objet d'une modération automatisée, complétée par une revue humaine en cas de signalement. FarataNikah se réserve le droit, selon la gravité du manquement constaté, d'adresser un avertissement, de suspendre temporairement un compte, ou de le bannir définitivement, sans préavis ni remboursement des sommes déjà versées au titre d'un abonnement en cours.",
        ],
      },
      {
        heading: "6. Signalement",
        paragraphs: [
          "Tout membre constatant un comportement contraire au présent règlement peut le signaler à l'adresse faratasn@gmail.com. Chaque signalement est examiné par l'équipe de modération dans les meilleurs délais.",
        ],
      },
      {
        heading: "7. Responsabilité du membre",
        paragraphs: [
          "Chaque membre est seul responsable des informations qu'il publie et des échanges qu'il engage avec d'autres membres. FarataNikah vérifie l'identité déclarée des profils mais ne peut garantir l'exactitude de toutes les informations fournies ni se substituer au jugement personnel de chaque membre dans sa recherche de conjoint.",
        ],
      },
    ],
  },

  confidentialite: {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    updatedAt: "13 août 2026",
    sections: [
      {
        heading: "1. Responsable du traitement",
        paragraphs: [
          "FarataNikah, dont le siège d'exploitation est situé à Dakar, Sénégal, est responsable du traitement des données personnelles collectées via la plateforme faratanikah.com. Pour toute question relative à cette politique ou pour exercer vos droits, vous pouvez nous contacter à l'adresse faratasn@gmail.com.",
        ],
      },
      {
        heading: "2. Données collectées",
        paragraphs: [
          "Nous collectons : les données d'inscription et de profil (prénom, date de naissance, genre, ville, pays, situation matrimoniale, pratique religieuse, critères de recherche, biographie) ; les photos de profil ; le contenu des messages échangés avec d'autres membres et avec l'assistante Coach Amina ; les données techniques de connexion ; et, pour les membres Premium, les données de transaction liées au paiement de l'abonnement (le numéro de carte ou de mobile money n'est jamais transmis à FarataNikah — il est traité directement par notre prestataire de paiement Moneroo).",
        ],
      },
      {
        heading: "3. Finalités du traitement",
        paragraphs: [
          "Ces données sont utilisées pour : créer et vérifier votre profil ; vous mettre en relation avec des profils compatibles ; assurer la modération et la sécurité des échanges (y compris par une analyse automatisée des messages) ; fournir les fonctionnalités de l'assistante Coach Amina ; gérer votre abonnement Premium et les paiements associés ; et communiquer avec vous au sujet de votre compte.",
        ],
      },
      {
        heading: "4. Base légale",
        paragraphs: [
          "Le traitement de vos données repose sur l'exécution du contrat qui vous lie à FarataNikah (fourniture du service), sur votre consentement (notamment pour les photos et le mode anonyme), et, le cas échéant, sur l'intérêt légitime de FarataNikah à assurer la sécurité de la plateforme.",
        ],
      },
      {
        heading: "5. Destinataires des données",
        paragraphs: [
          "Vos données sont hébergées et traitées par nos sous-traitants techniques : Supabase (hébergement de la base de données et des photos), Anthropic (analyse automatisée des messages et fonctionnement de Coach Amina), Vercel (hébergement de l'application), et Moneroo (traitement des paiements). Chacun de ces prestataires n'accède qu'aux données strictement nécessaires à l'exécution de sa mission. Vos données ne sont ni vendues ni louées à des tiers à des fins commerciales.",
        ],
      },
      {
        heading: "6. Durée de conservation",
        paragraphs: [
          "Vos données sont conservées pendant toute la durée de vie de votre compte. En cas de suppression de compte, vos données de profil et vos photos sont supprimées sous 30 jours, sauf obligation légale de conservation plus longue (notamment les données de facturation).",
        ],
      },
      {
        heading: "7. Vos droits",
        paragraphs: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement de vos données, ainsi que d'un droit à la portabilité. Vous pouvez exercer ces droits directement depuis les paramètres de votre compte pour la plupart des informations, ou en nous écrivant à faratasn@gmail.com. Nous répondons à toute demande dans un délai raisonnable.",
        ],
      },
      {
        heading: "8. Sécurité",
        paragraphs: [
          "L'accès à vos données est protégé par des règles de sécurité au niveau de la base de données (chaque membre ne peut accéder qu'à ses propres données et aux profils publiés par d'autres membres approuvés), par le chiffrement des communications, et par un stockage des photos dans un espace privé dont l'accès est contrôlé selon vos réglages de confidentialité.",
        ],
      },
      {
        heading: "9. Transferts internationaux",
        paragraphs: [
          "Certains de nos sous-traitants opèrent des infrastructures situées hors du Sénégal. Nous veillons à ce que ces transferts s'accompagnent de garanties appropriées de la part de nos prestataires.",
        ],
      },
      {
        heading: "10. Cookies",
        paragraphs: [
          "FarataNikah utilise des cookies strictement nécessaires au fonctionnement du service (maintien de votre session de connexion). Aucun cookie publicitaire ou de traçage tiers n'est utilisé à ce jour.",
        ],
      },
    ],
  },

  "mentions-legales": {
    slug: "mentions-legales",
    title: "Mentions légales",
    updatedAt: "13 août 2026",
    sections: [
      {
        heading: "Éditeur du site",
        paragraphs: [
          "Le site faratanikah.com est édité par FarataNikah, dont l'activité est exploitée depuis Dakar, Sénégal. Contact : faratasn@gmail.com.",
        ],
      },
      {
        heading: "Directeur de publication",
        paragraphs: [
          "Le directeur de publication est le représentant de FarataNikah, joignable à l'adresse faratasn@gmail.com.",
        ],
      },
      {
        heading: "Hébergement",
        paragraphs: [
          "L'application est hébergée par Vercel Inc. La base de données, l'authentification et le stockage des fichiers sont hébergés par Supabase.",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        paragraphs: [
          "L'ensemble des éléments composant le site faratanikah.com (textes, structure, identité visuelle, marque FarataNikah) est protégé au titre de la propriété intellectuelle. Toute reproduction non autorisée est interdite.",
        ],
      },
    ],
  },

  cgv: {
    slug: "cgv",
    title: "Conditions Générales de Vente",
    updatedAt: "13 août 2026",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "Les présentes Conditions Générales de Vente régissent la souscription à l'abonnement FarataNikah Premium par les membres de la plateforme faratanikah.com.",
        ],
      },
      {
        heading: "2. Description de l'offre",
        paragraphs: [
          "L'abonnement FarataNikah Premium donne accès à des fonctionnalités additionnelles : demandes de contact illimitées, questions illimitées à Coach Amina, visibilité de la liste des membres ayant consulté ou mis en favori votre profil, jusqu'à 10 photos HD, filtres de recherche avancés, messagerie vocale, meilleur classement dans les résultats de recherche, et un badge de profil vérifié Premium. Le détail des fonctionnalités incluses est présenté sur la page Tarifs.",
        ],
      },
      {
        heading: "3. Prix",
        paragraphs: [
          "L'abonnement Premium est proposé au tarif de lancement de 5 900 FCFA par mois. Ce tarif est susceptible d'évoluer ; tout changement de prix sera annoncé avant son entrée en vigueur et ne s'appliquera pas aux abonnements en cours avant leur prochain renouvellement.",
        ],
      },
      {
        heading: "4. Modalités de paiement",
        paragraphs: [
          "Le paiement s'effectue via notre prestataire Moneroo, qui prend en charge le paiement par mobile money (Orange Money, MTN Mobile Money, Moov Money, Wave, selon disponibilité) et par carte bancaire. FarataNikah ne collecte ni ne conserve aucune donnée de carte bancaire ou de compte mobile money.",
        ],
      },
      {
        heading: "5. Durée et renouvellement",
        paragraphs: [
          "L'abonnement Premium est souscrit pour une durée d'un mois et se renouvelle par tacite reconduction. Le renouvellement est traité comme un nouveau paiement à échéance mensuelle ; à défaut de paiement réussi à l'échéance, l'abonnement bascule automatiquement sur le plan Gratuit.",
        ],
      },
      {
        heading: "6. Résiliation",
        paragraphs: [
          "Chaque membre peut résilier son abonnement à tout moment depuis la page Paramètres de son compte. La résiliation prend effet à la fin de la période déjà payée ; aucun remboursement au prorata n'est effectué pour la période en cours, sauf disposition légale contraire applicable.",
        ],
      },
      {
        heading: "7. Réclamations",
        paragraphs: [
          "Toute réclamation relative à un paiement ou à l'abonnement Premium peut être adressée à faratasn@gmail.com. FarataNikah s'engage à traiter chaque demande dans les meilleurs délais.",
        ],
      },
    ],
  },

  dpa: {
    slug: "dpa",
    title: "Accord de traitement des données (DPA)",
    updatedAt: "13 août 2026",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "Le présent document précise les engagements de FarataNikah, agissant en qualité de responsable de traitement, concernant le recours à des sous-traitants pour le compte des membres de la plateforme faratanikah.com.",
        ],
      },
      {
        heading: "2. Sous-traitants",
        paragraphs: [
          "FarataNikah a recours aux sous-traitants suivants dans le cadre de l'exploitation de la plateforme : Supabase (hébergement de la base de données, authentification, stockage des photos), Vercel Inc. (hébergement de l'application web), Anthropic (traitement automatisé des messages à des fins de modération, et fonctionnement de l'assistante conversationnelle Coach Amina), et Moneroo (traitement des paiements par mobile money et carte bancaire).",
        ],
      },
      {
        heading: "3. Engagements de FarataNikah",
        paragraphs: [
          "FarataNikah s'engage à ne recourir qu'à des sous-traitants présentant des garanties suffisantes en matière de sécurité et de confidentialité des données, à limiter l'accès de chaque sous-traitant aux seules données nécessaires à l'exécution de sa mission, et à informer ses membres de tout changement significatif dans la liste de ses sous-traitants.",
        ],
      },
      {
        heading: "4. Sécurité",
        paragraphs: [
          "Les mesures de sécurité mises en œuvre incluent le contrôle d'accès aux données au niveau de la base de données (chaque membre n'accédant qu'à ses propres données et aux profils approuvés), le chiffrement des communications, et le stockage des photos dans un espace de stockage privé dont l'accès est conditionné par les réglages de confidentialité du membre.",
        ],
      },
      {
        heading: "5. Contact",
        paragraphs: [
          "Pour toute question relative au traitement de vos données ou à cet accord, vous pouvez contacter FarataNikah à l'adresse faratasn@gmail.com.",
        ],
      },
    ],
  },
};
