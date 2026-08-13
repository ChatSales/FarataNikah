# Farata.net

Plateforme de rencontre halal orientée mariage, pour l'Afrique francophone.
Next.js (App Router) + Supabase (Postgres/Auth/Storage).

## État du projet — M1 (terminé)

- Landing page publique (accueil, tarifs, sécurité, témoignages, footer légal)
- Auth Supabase (inscription, connexion, mot de passe oublié/réinitialisation)
- Onboarding en 4 étapes (infos de base, pratique religieuse, photos, confidentialité)
- File d'attente de vérification manuelle (schéma + statut `pending`/`approved`/`rejected`) — le back-office admin pour approuver/rejeter arrive en **M2**
- Middleware (`proxy.ts`) qui protège `/app`, `/admin`, `/onboarding` et redirige selon le statut de vérification

Prochaines étapes prévues : M2 (découverte de profils, demandes de contact,
back-office de vérification), M3 (messagerie + modération IA), M4 (coach IA
Cheikh Moussa), M5 (paiements Premium), M6 (pages légales définitives, stats
admin, polish).

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
`SUPABASE_SERVICE_ROLE_KEY` et `NEXT_PUBLIC_APP_URL`. Les clés IA/paiement ne
sont pas nécessaires avant M4/M5.

### 3. Appliquer les migrations

Dans l'éditeur SQL du dashboard Supabase, exécute dans l'ordre :
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_storage.sql`

(Ou via la CLI Supabase : `supabase link` puis `supabase db push`.)

### 4. Créer un compte admin (pour valider les profils plus tard)

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

1. `/signup` → créer un compte
2. Confirmer l'email (lien envoyé par Supabase vers `/auth/confirm`)
3. `/onboarding/basic-info` → `religious-practice` → `photos` → `privacy`
4. `/onboarding/pending` — le profil reste `pending` tant qu'aucun admin ne
   l'approuve manuellement (`update profiles set verification_status = 'approved' where user_id = '...'` en attendant le back-office M2)
5. Une fois approuvé, `/app/discover` devient accessible

## Structure

```
app/(marketing)/     landing page publique + pages légales
app/(auth)/          inscription, connexion, mot de passe
app/(onboarding)/    wizard de création de profil
app/(app)/           application principale (post-vérification)
app/auth/confirm/    callback Supabase (confirmation email, recovery)
actions/             Server Actions (auth, profil)
lib/supabase/        clients Supabase (browser, server, admin) + types DB
components/          composants React par domaine (marketing, auth, onboarding)
supabase/migrations/ schéma SQL + politiques RLS
content/legal.ts      contenu placeholder des pages légales (à valider juridiquement)
```

## Notes importantes

- Les pages légales (`/legal/*`) contiennent un texte **provisoire**, à faire
  relire par un juriste avant tout lancement public.
- La vérification manuelle des profils n'a pas encore d'interface admin :
  pour l'instant, approuver un profil se fait directement en SQL.
- Les photos de profil sont stockées dans un bucket Supabase Storage privé ;
  seul le propriétaire peut lire/écrire ses propres fichiers pour l'instant.
  L'affichage des photos d'un profil *par un autre utilisateur* (avec flou/
  mode anonyme) arrive avec la fonctionnalité de découverte en M2.
