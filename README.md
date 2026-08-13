# Farata.net

Plateforme de rencontre halal orientée mariage, pour l'Afrique francophone.
Next.js (App Router) + Supabase (Postgres/Auth/Storage) + Claude (Anthropic).

## État du projet — M1 à M3 terminés, M4 en cours

- **M1** — Landing page publique, auth Supabase, onboarding en 4 étapes,
  schéma DB + vérification manuelle (statut `pending`/`approved`/`rejected`),
  middleware de protection des routes.
- **M2** — Découverte de profils avec filtres et score de compatibilité
  (heuristique, pas encore une vraie IA), demandes de contact (envoyer/
  accepter/refuser, limite quotidienne gratuite), back-office admin de
  vérification des profils.
- **M3** — Messagerie 1:1 dans les conversations acceptées, modération des
  messages par Claude (Haiku) avant envoi, file de modération admin,
  favoris, visites de profil (verrouillées Premium au niveau RLS).
- **M4** (en cours) — Coach IA **Amina** : chat conversationnel, limite
  quotidienne gratuite de questions.

Prochaines étapes : M5 (paiements Premium), M6 (pages légales définitives,
stats admin, polish).

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
nécessaire pour la modération des messages (M3) et le coach IA (M4). Les clés
de paiement ne sont pas nécessaires avant M5.

### 3. Appliquer les migrations

Dans l'éditeur SQL du dashboard Supabase, exécute dans l'ordre tous les
fichiers de `supabase/migrations/` (0001 à 0005, plus les suivants au fur et
à mesure qu'ils sont ajoutés).

(Ou via la CLI Supabase : `supabase link` puis `supabase db push`.)

### 4. Créer un compte admin

Une fois qu'un utilisateur existe dans `auth.users`, ajoute-le à `admin_users`
directement en SQL (pas d'auto-inscription admin) :

```sql
insert into admin_users (user_id, role)
values ('<uuid-de-l-utilisateur>', 'admin');
```

### 5. Lancer le serveur de développement

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
4. Une fois approuvé : `/app/discover` (profils + filtres), `/app/requests`
   (demandes de contact), `/app/messages` (messagerie), `/app/favorites`,
   `/app/visitors` (Premium)

## Structure

```
app/(marketing)/     landing page publique + pages légales
app/(auth)/          inscription, connexion, mot de passe
app/(onboarding)/    wizard de création de profil
app/(app)/           application principale (post-vérification)
app/(admin)/         back-office (vérification, modération)
app/auth/confirm/    callback Supabase (confirmation email, recovery)
actions/             Server Actions (auth, profil, demandes, messages, favoris, admin)
lib/supabase/        clients Supabase (browser, server, admin) + types DB
lib/claude/          intégration Claude (modération, coach IA)
lib/matching/        score de compatibilité
components/          composants React par domaine
supabase/migrations/ schéma SQL + politiques RLS
content/legal.ts      contenu placeholder des pages légales (à valider juridiquement)
```

## Notes importantes

- Les pages légales (`/legal/*`) contiennent un texte **provisoire**, à faire
  relire par un juriste avant tout lancement public.
- Le score de compatibilité affiché dans Discover est une heuristique basée
  sur des règles (pays, âge, madhhab, situation matrimoniale) — pas un vrai
  scoring IA pour l'instant.
- Les photos de profil sont stockées dans un bucket Supabase Storage privé ;
  elles ne sont révélées à un autre membre qu'une fois une demande de contact
  acceptée (ou si `blur_photos` est désactivé par le propriétaire).
