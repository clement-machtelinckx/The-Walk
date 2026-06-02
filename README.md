# The-Walk

The-Walk est une application privée de gestion de tables de jeu de rôle.

Le projet couvre déjà les besoins principaux d'une table JDR numérique : gestion des tables, membres et rôles, invitations ciblées ou partageables, préparation de session, RSVP, session live, présence, chat, notes et espace d'administration MJ.

Ce README décrit l'état réel du repo pour faciliter une reprise technique du projet.

## Stack

- **Next.js App Router** avec React Server Components et route handlers dans `app/api/`
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** avec composants dans `components/ui/`
- **Supabase** pour Auth, Postgres, migrations, RLS et environnement local
- **Zustand** pour certains états client
- **Zod** pour les schémas de validation
- **Vitest**, **Testing Library** et **jsdom** pour les tests

## Architecture du repo

```text
app/
components/
lib/
store/
supabase/
```

### `app/`

Contient les routes Next.js App Router.

- `app/(pages)/(public)/` : pages publiques comme login, register et acceptation d'invitation.
- `app/(pages)/(app)/` : pages applicatives protégées, notamment tables, détail de table, prochaine session, live session, admin table et mon compte.
- `app/api/` : route handlers utilisés par le front. Ils valident les entrées, récupèrent l'utilisateur courant et délèguent la logique métier aux services.
- `app/manifest.ts` : manifeste PWA minimal.

### `components/ui/`

Composants UI de base issus de shadcn/ui ou compatibles avec ce système : `Button`, `Card`, `Dialog`, `Input`, `Tabs`, etc.

Par convention, on réutilise ces primitives avant de créer un composant visuel ad hoc.

### `components/[feature]/`

Composants organisés par domaine fonctionnel :

- `components/auth/`
- `components/table/`
- `components/session/`
- `components/session/notes/`
- `components/admin/`
- `components/invitation/`
- `components/layout/`
- `components/special/`

Ces composants gèrent le rendu, les interactions et l'appel aux endpoints applicatifs. Ils ne doivent pas porter la logique d'autorisation ou les règles métier sensibles.

### `lib/repositories/`

Couche de persistance.

Les repositories encapsulent les accès Supabase/Postgres : lectures, insertions, mises à jour et requêtes métier proches de la base. Ils ne doivent pas contenir l'orchestration fonctionnelle complète.

### `lib/services/`

Couche de logique métier serveur.

Les services orchestrent les repositories, appliquent les règles de domaine et centralisent les contrôles importants : membership, rôle MJ, droits sur une table, transitions de session, invitations, présence, messages et notes.

### `lib/validators/`

Schémas Zod et contrats d'entrée.

Les route handlers et services s'appuient sur ces validators pour éviter de propager des payloads non contrôlés dans la logique métier.

### `lib/auth/`

Helpers serveur liés à l'authentification et aux permissions de base :

- utilisateur courant
- session obligatoire
- vérification d'appartenance à une table
- vérification de rôle sur une table

### `lib/supabase/` et `lib/db/`

- `lib/supabase/` : clients Supabase browser/server et middleware de session.
- `lib/db/` : conventions de persistance et client service role pour les opérations serveur qui le nécessitent.

### `store/`

Stores Zustand pour certains états client : auth, tables, invitations, sessions.

Ces stores restent côté client. Ils ne remplacent pas les validations serveur ni les contrôles de permissions.

### `supabase/`

Configuration Supabase locale, migrations SQL et seed de développement.

- `supabase/config.toml` : configuration du projet local.
- `supabase/migrations/` : schéma et évolutions DB.
- `supabase/seed.sql` : données rejouées lors d'un reset local.

## Installation locale

Prérequis :

- Node.js compatible avec le projet
- npm
- Docker Desktop pour Supabase local

Installer les dépendances :

```bash
npm install
```

Créer un fichier `.env.local` à partir de `.env.example`, puis renseigner les variables Supabase :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
THE_CRAWL_URL=
```

Pour un environnement Supabase local, les valeurs peuvent être récupérées avec :

```bash
npx supabase status -o env
```

Lancer Next.js en développement :

```bash
npm run dev
```

L'application est ensuite disponible sur l'URL affichée par Next.js, généralement `http://localhost:3000`.

## Emails transactionnels

Le système email utilise une abstraction provider avec Mailtrap en développement et Brevo en production. Les emails sont journalisés dans `email_delivery_logs` et le quota mensuel par utilisateur émetteur est configurable.

Variables communes :

```bash
EMAIL_PROVIDER=mailtrap
EMAIL_FROM_EMAIL=noreply@the-walk.local
EMAIL_FROM_NAME=The-Walk
EMAIL_MONTHLY_QUOTA=20
ALWAYS_MAIL_TO=
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

Pour le développement local, utiliser Mailtrap :

```bash
MAILTRAP_API_TOKEN=
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
```

Pour la production, utiliser Brevo :

```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
```

Valeurs par défaut côté code :

- `EMAIL_PROVIDER` : `mailtrap` hors production, `brevo` en production.
- `EMAIL_FROM_EMAIL` : `noreply@the-walk.local`.
- `EMAIL_FROM_NAME` : `The-Walk`.
- `EMAIL_MONTHLY_QUOTA` : `20`.
- `ALWAYS_MAIL_TO` : désactivé si vide. Si renseigné, tous les emails transactionnels sont envoyés à cette adresse et le destinataire original est conservé en metadata du journal.
- `MAILTRAP_API_URL` et `BREVO_API_URL` : endpoints API standards des providers.

`NEXT_PUBLIC_APP_URL` est prioritaire pour générer les liens d'action dans les emails. `APP_URL` sert de fallback serveur, puis `VERCEL_URL` si disponible.

## Supabase local

Supabase local dépend de Docker.

Si Docker Desktop n'est pas lancé, `npx supabase start`, `npx supabase status` et `npx supabase db reset` ne fonctionneront pas correctement.

Démarrer Supabase local :

```bash
npx supabase start
```

Afficher les URLs, ports et variables d'environnement locales :

```bash
npx supabase status
```

Afficher les variables au format `.env` :

```bash
npx supabase status -o env
```

Réinitialiser la base locale, rejouer les migrations et le seed :

```bash
npx supabase db reset
```

Arrêter Supabase local :

```bash
npx supabase stop
```

## Seed local

Le fichier `supabase/seed.sql` contient des données utiles au développement local.

Il est rejoué automatiquement par Supabase lors d'un reset DB, car `supabase/config.toml` active le seed :

```bash
npx supabase db reset
```

Attention : cette commande remet la base locale à zéro, applique les migrations, puis recharge le seed.

## Commandes projet

Installer les dépendances :

```bash
npm install
```

Serveur de développement :

```bash
npm run dev
```

Lint :

```bash
npm run lint
```

Tests :

```bash
npm run test
```

Tests en watch :

```bash
npm run test:watch
```

Coverage :

```bash
npm run test:coverage
```

Build production :

```bash
npm run build
```

Démarrage après build :

```bash
npm start
```

Commandes supplémentaires présentes :

```bash
npm run lint:fix
npm run format
```

## Domaines fonctionnels présents

- Authentification Supabase : login, register, logout, changement de mot de passe, login par token.
- Tables et memberships : création de table, liste des tables, détail, rôles `gm`, `player`, `observer`.
- Invitations ciblées : invitation par email/token pour rejoindre une table.
- Invitations de groupe : lien partageable temporaire avec rôle associé.
- Prochaine session : création, affichage, mise à jour et historique.
- RSVP : réponse utilisateur à une session.
- Présence : statut de présence sur une session.
- Live session : démarrage, fin et hub de session active.
- Chat : messages de préparation et messages live.
- Notes : notes personnelles et notes de groupe.
- Admin MJ : actions rapides, invitations, membres et gestion de session.
- Mon compte : page simple de profil/compte.
- PWA minimale : manifeste applicatif et favicon.

## Conventions importantes

- La logique de permission ne doit pas vivre côté client. Le client peut adapter l'affichage, mais les droits doivent être vérifiés côté serveur.
- Les **services** portent la logique métier et l'orchestration.
- Les **repositories** portent la persistance et les accès directs à la base.
- Les **validators** définissent les contrats d'entrée et valident les payloads.
- Les **composants** gèrent le rendu, les interactions et les appels aux endpoints.
- L'interface est pensée mobile-first.
- shadcn/ui est la base par défaut pour les composants d'interface.
- Éviter les fetchs réutilisables inline dans les composants clients : extraire les appels répétés ou métier pour garder les composants lisibles.
- Les relations métier doivent utiliser `public.profiles`, pas directement `auth.users`.

## Base de données

Le schéma V1 est géré par les migrations Supabase.

Entités principales :

- `profiles`
- `tables`
- `table_memberships`
- `sessions`
- `session_responses`
- `session_presence`
- `invitations`
- `table_group_invitations`
- `pre_session_messages`
- `live_session_messages`
- `personal_notes`
- `group_notes`

Supabase Auth gère `auth.users`. Un trigger crée le profil applicatif correspondant dans `public.profiles` lors de l'inscription.

## Tests

Le projet utilise Vitest avec environnement `jsdom` et setup Testing Library.

Des tests existent notamment autour de services, route handlers et composants de session/auth. La couverture n'est pas exhaustive : quand une règle métier serveur est modifiée, ajouter ou ajuster les tests proches du service ou de la route concernée.

## État du projet

Le projet est dans un état de V1 avancée.

Beaucoup de briques fonctionnelles sont déjà présentes et reliées à Supabase. Les parcours, la navigation et certaines finitions produit/UX restent encore perfectibles. Une reprise du projet doit donc privilégier la consolidation des flux existants, la cohérence des permissions serveur et la rationalisation progressive de l'expérience utilisateur.
