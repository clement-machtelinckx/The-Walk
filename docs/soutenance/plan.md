# Plan de soutenance

## 1. Introduction

- Presenter The-Walk : application privee pour organiser une table de jeu de role.
- Expliquer le besoin : centraliser table, membres, session, presence, messages et outils live.

## 2. Perimetre produit

- Tables et membres.
- Invitations.
- Sessions et RSVP.
- Live session et outils.
- Notifications et emails.

## 3. Architecture technique

- Next.js App Router.
- Supabase Auth/Postgres/RLS.
- Separation composants, route handlers, services, repositories et validators.
- Controle des permissions cote serveur.

## 4. Demonstration

- Enchainer un parcours court depuis la table jusqu'a la session live.
- Montrer un signal notification/email si l'environnement le permet.

## 5. Arbitrages

- Simplicite V1.
- Priorite aux controles serveur.
- Modules live activables plutot qu'une page surchargee.

## 6. Etat actuel et perspectives

- Ce qui fonctionne.
- Ce qui reste a consolider.
- Evolutions possibles.
