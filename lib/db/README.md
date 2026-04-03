# Architecture de persistance des données

Ce dossier contient la couche d'accès aux données (Persistence Layer) du projet The-Walk.

## Organisation

- `lib/supabase/` : Intégration technique et création des clients Supabase (Browser/Server/Middleware).
- `lib/db/` : Couche d'accès DB propre au projet. Conventions, helpers serveur et points d'entrée métier.

## Convention Utilisateurs

Le projet utilise une séparation nette entre l'authentification et les données métier :
- **auth.users** : Géré exclusivement par Supabase Auth. Contient les identifiants techniques.
- **public.profiles** : Entité métier "User" de l'application. C'est cette table qui doit être utilisée pour toutes les relations métier (FKs). Un trigger assure la création automatique d'un profil lors d'un nouvel import/signup.

## Principes

1. Les pages et composants ne doivent pas manipuler directement les clients Supabase pour la logique métier complexe.
2. Utiliser les **Repositories** (dans `lib/repositories/`) pour les opérations CRUD et requêtes complexes.
3. Les **Validators** (dans `lib/validators/`) doivent être utilisés pour valider les données avant insertion.
4. Cette couche s'appuie sur le schéma SQL défini dans `supabase/migrations/`.

## Schéma V1

Les entités principales sont :
- `profiles` : Profils utilisateurs (The-Walk core user).
- `tables` : Tables de jeu.
- `table_memberships` : Liens entre utilisateurs et tables (`gm`, `player`, `observer`).
- `sessions` : Sessions de jeu (`scheduled`, `active`, `completed`, `cancelled`).
- `session_responses` : Présences et réponses aux sessions (`going`, `maybe`, `declined`, `pending`).
- `session_presence` : Statut de présence métier (`present`, `absent`, `late`, `excused`).
- `invitations` : Système d'invitation par lien (token) ou email (`pending`, `accepted`, `declined`, `expired`).
- `pre_session_messages` : Canal de préparation.
- `live_session_messages` : Canal de jeu en direct.
- `notes` : Notes personnelles et de groupe.
