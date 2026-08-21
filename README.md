# FarataNikah

Plateforme de rencontre halal orientée mariage, pour l'Afrique francophone.
Next.js (App Router) + Supabase (Postgres/Auth/Storage) + Claude (Anthropic) + Moneroo.

## État du projet — M1 à M6

- **M1** — Landing page publique, auth Supabase, onboarding en 4 étapes,
  schéma DB + vérification manuelle, middleware de protection des routes.
- **M2** — Découverte de profils avec filtres et score de compatibilité
  (heuristique, complété en M7 par un vrai score Claude), demandes de
  contact, back-office admin de vérification des profils.
- **M7** — Rebranding FarataNikah, suppression de compte en libre-service,
  case CGU obligatoire à l'inscription, messages vocaux Premium, score de
  compatibilité IA (Claude, mis en cache), filtres de recherche avancés
  Premium (profession, études, pratique religieuse), analytics, SEO
  (sitemap/robots).
- **M3** — Messagerie 1:1, modération des messages par Claude (Haiku),
  file de modération admin, favoris, visites de profil (Premium).
- **M4** — Coach IA **Amina** : chat conversationnel streamé, limite
  quotidienne gratuite de questions.
- **M5** — Abonnement Premium via **Moneroo** (mobile money + carte) :
  checkout, webhook de confirmation, cron d'expiration mensuelle.
- **M6** — Stats admin, page Paramètres/Abonnement, pages légales
  (Règlement, Confidentialité, Mentions légales, CGV, DPA).

## Démarrer en local

### 1. Créer un projet Supabase

Sur [supabase.com](https://supabase.com), crée un nouveau projet, puis récupère
dans **Project Settings > API** :
- l'URL du projet
- la clé `anon public`
- la clé `service_role` (secrète — ne jamais l'exposer côté client)

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Renseigne au minimum `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` et `NEXT_PUBLIC_APP_URL`. `ANTHROPIC_API_KEY` est
nécessaire pour la modération des messages et le coach IA. `MONEROO_API_KEY` /
`MONEROO_WEBHOOK_SECRET` sont nécessaires pour tester le paiement Premium.
`CRON_SECRET` protège le cron d'expiration d'abonnement (Vercel l'envoie
automatiquement s'il est défini comme variable d'environnement du projet).

### 3. Appliquer les migrations

Dans l'éditeur SQL du dashboard Supabase, exécute dans l'ordre tous les
fichiers de `supabase/migrations/` (0001 à 0007, plus les suivants au fur et
à mesure qu'ils sont ajoutés).

(Ou via la CLI Supabase : `supabase link` puis `supabase db push`.)

### 4. Créer un compte admin

Une fois qu'un utilisateur existe dans `auth.users`, ajoute-le à `admin_users`
directement en SQL (pas d'auto-inscription admin) :

```sql
insert into admin_users (user_id, role)
values ('<uuid-de-l-utilisateur>', 'admin');
```

### 5. Configurer le webhook Moneroo

Dans le dashboard Moneroo, configure l'URL de webhook vers
`https://<ton-domaine>/api/payments/webhook/moneroo` et récupère le secret de
signature pour `MONEROO_WEBHOOK_SECRET`.

### 6. Lancer le serveur de développement

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Parcours à tester

1. `/signup` → créer un compte, confirmer l'email
2. `/onboarding/basic-info` → `religious-practice` → `photos` → `privacy`
3. `/onboarding/pending` — le profil reste `pending` jusqu'à validation par
   un admin via `/admin/verification`
4. Une fois approuvé : `/app/discover`, `/app/requests`, `/app/messages`,
   `/app/favorites`, `/app/visitors` (Premium), `/app/coach`
5. `/app/premium` → passer Premium / acheter un Boost (redirige vers le checkout Moneroo)

## Structure

```
app/(marketing)/     landing page publique + pages légales
app/(auth)/          inscription, connexion, mot de passe
app/(onboarding)/    wizard de création de profil
app/(app)/           application principale (post-vérification)
app/(admin)/         back-office (vérification, modération, stats)
app/api/payments/    checkout, webhook Moneroo
app/api/cron/        expiration d'abonnement
app/api/coach/       endpoint de chat streamé
app/auth/confirm/    callback Supabase (confirmation email, recovery)
actions/             Server Actions (auth, profil, demandes, messages, favoris, admin, paiements)
lib/supabase/        clients Supabase (browser, server, admin) + types DB
lib/claude/          intégration Claude (modération, coach IA)
lib/payments/        intégration Moneroo
lib/matching/        score de compatibilité
components/          composants React par domaine
supabase/migrations/ schéma SQL + politiques RLS
content/legal.ts      contenu des pages légales
```

## Notes importantes

- Le score de compatibilité affiché dans Discover combine une heuristique
  basée sur des règles (pays, âge, madhhab, situation matrimoniale) pour le
  pré-classement, et un vrai score Claude (mis en cache 30 jours dans
  `compatibility_scores`) pour les meilleures correspondances de chaque page.
- Les photos de profil sont stockées dans un bucket Supabase Storage privé ;
  elles ne sont révélées à un autre membre qu'une fois une demande de contact
  acceptée (ou si `blur_photos` est désactivé par le propriétaire).
- Le texte des pages légales (`content/legal.ts`) a été rédigé pour refléter
  fidèlement le fonctionnement réel de la plateforme, mais n'a pas été relu
  par un juriste — à faire avant tout traitement de paiements réels à grande
  échelle, notamment pour la conformité OHADA/sénégalaise et la protection
  des données dans les autres marchés servis.
- La page Mentions légales ne comporte pas de numéro RCCM/NINEA (société non
  encore immatriculée au moment de la rédaction) — à compléter dès
  l'immatriculation effective.
