# Modele de donnees

Cette page resume les principales entites metier. Le schema exact reste dans `supabase/migrations/`.

## Utilisateurs et tables

- `profiles` : profil applicatif lie a `auth.users`, avec email, nom d'affichage et avatar.
- `tables` : table de jeu, avec nom, description et `owner_id`.
- `table_memberships` : relation utilisateur/table avec role `gm`, `player` ou `observer`.

## Sessions

- `sessions` : session rattachee a une table, avec statut `scheduled`, `active`, `completed` ou `cancelled`.
- `session_responses` : reponse RSVP d'un membre : `going`, `maybe`, `declined`, `pending`.
- `session_presence` : presence pendant ou autour de la session : `present`, `absent`, `late`, `excused`.
- `session_live_enabled_modules` : modules live actives par session.

## Invitations

- `invitations` : invitation ciblee par email, role prevu, token, statut et expiration.
- `table_group_invitations` : lien partageable temporaire pour rejoindre une table avec un role donne.

## Messages et notes

- `table_messages` : discussion publique permanente de table, avec contexte de session optionnel.
- `table_private_messages` : messages prives 1-to-1 dans le contexte d'une table, avec session optionnelle.
- `personal_notes` : notes personnelles rattachees a un utilisateur, avec table/session optionnelles.
- `group_notes` : notes partagees au niveau table, avec session optionnelle.

## Outils et suivi

- `session_dice_rolls` : journal de jets de des, rattache a une table et optionnellement a une session.
- `notifications` : notifications in-app par utilisateur, avec type, titre, lien, etat lu/non lu et metadata.
- `email_delivery_logs` : journal d'envoi email, statut, provider, quota, erreurs et metadata.

## Remarques

- Les roles sont stockes dans `table_memberships`.
- `tables.owner_id` identifie le createur/proprietaire, mais l'administration courante passe surtout par le role `gm`.
- Les migrations hardening ajoutent des politiques RLS pour limiter les acces directs en base.
- La discussion publique est adressee par `table_id` dans l'API et l'etat client ; `session_id`
  qualifie seulement le contexte d'emission d'un message.
