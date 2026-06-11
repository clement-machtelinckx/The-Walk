# Structure applicative

## Organisation principale

- `app/` : routes Next.js App Router, layouts, pages publiques/protegees, metadata et route handlers API.
- `components/` : composants UI et composants par domaine fonctionnel.
- `lib/` : auth, clients Supabase, services metier, repositories, validators, email et utilitaires.
- `store/` : stores Zustand pour certains etats client, dont un store dedie a la discussion
  publique de table.
- `supabase/` : configuration locale, migrations SQL et seed.
- `types/` : types TypeScript partages par domaine.
- `config/` : configuration applicative visible, comme site et avatars.

## Routes

- `app/(pages)/(public)/` : accueil, about, FAQ, login, register, acceptation d'invitation.
- `app/(pages)/(app)/` : espace connecte, compte, liste des tables, detail table, admin table, prochaine session et live session.
- `app/api/` : endpoints auth, tables, sessions, invitations, notifications, emails, messages, notes, presence, modules live et des.

## Composants

- `components/ui/` contient les primitives UI reutilisables.
- Les dossiers `components/table`, `components/session`, `components/admin`, `components/auth`, `components/notifications`, etc. portent les vues et interactions par domaine.
- Les composants ne doivent pas etre la source de verite des permissions sensibles.

## Lib

- `lib/auth/` : helpers serveur pour utilisateur courant, auth obligatoire et roles de table.
- `lib/services/` : orchestration metier et controle des droits.
- `lib/repositories/` : acces Supabase/Postgres.
- `lib/validators/` : schemas Zod pour les payloads.
- `lib/email/` et `lib/services/email/` : templates, providers et service transactionnel.
- `lib/supabase/` et `lib/db/` : clients Supabase selon contexte.

## Tests

- Les tests sont proches des domaines concernes : services, repositories, route handlers, stores et composants.
- Le script `npm run test:coverage` existe pour produire un rapport de couverture.
- Les tests end-to-end ne sont pas encore en place.

## Principes

- Validation des entrees avant traitement metier.
- Permissions cote serveur, completees par RLS Supabase.
- Separation entre affichage, orchestration metier et persistance.
- UI organisee par domaine pour faciliter la reprise.
