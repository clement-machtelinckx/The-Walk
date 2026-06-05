# Vue d'ensemble du projet

The-Walk est une application privee de gestion de tables de jeu de role. Elle vise a couvrir les besoins d'une table JDR numerique : organisation des tables, membres, invitations, preparation de session, RSVP, session live, outils de table et suivi d'activite.

## Stack

- Next.js App Router, React Server Components et route handlers dans `app/api/`.
- TypeScript.
- Tailwind CSS 4 et composants `shadcn/ui`.
- Supabase pour Auth, Postgres, migrations, RLS et environnement local.
- Zod pour les validations.
- Zustand pour certains etats client.
- Vitest, Testing Library et jsdom pour les tests.

## Etat actuel

Le projet dispose deja d'une base fonctionnelle : authentification, tables, membres, roles, invitations ciblees ou partageables, sessions, RSVP, presence, messages, notes, des, notifications in-app et emails transactionnels.

La logique sensible est principalement cote serveur via services, repositories, route handlers et politiques RLS Supabase.

L'etat produit detaille est maintenu dans `docs/product/features.md`. La priorisation et les points a consolider sont dans `docs/product/roadmap.md`.

## Domaines fonctionnels

- Authentification et profil utilisateur.
- Tables JDR et administration par MJ.
- Membres, roles et invitations.
- Sessions planifiees, actives, terminees ou annulees.
- Session live avec modules activables.
- Messages de pre-session, live chat et messages prives.
- Notes personnelles et notes de groupe.
- Journal de jets de des.
- Centre de notifications global.
- Emails transactionnels et suivi de quota.

## Logique generale

Les pages App Router affichent les vues publiques ou protegees. Les composants client appellent les endpoints `app/api/`. Les route handlers valident les entrees, recuperent l'utilisateur courant et deleguent aux services. Les services appliquent les regles metier et les permissions, puis utilisent les repositories pour acceder a Supabase.

## Limites actuelles

- Les parcours critiques ne sont pas encore couverts par des tests end-to-end.
- Le live est mobile-first, mais doit encore etre valide sur appareil reel.
- Les notifications in-app ne sont pas encore en temps reel global.
- La documentation d'exploitation/deploiement reste a produire si le projet vise une livraison production.
