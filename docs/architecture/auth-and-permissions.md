# Authentification et permissions

## Auth Supabase

L'authentification technique repose sur Supabase Auth. Chaque utilisateur Supabase est associe a un profil metier dans `profiles`.

Les clients Supabase sont separes selon le contexte :

- client navigateur pour les interactions client autorisees ;
- client serveur pour les route handlers et Server Components ;
- client service role pour certaines operations serveur systeme.

## Helpers serveur

`lib/auth/server.ts` expose les helpers principaux :

- `getCurrentUser()` : recupere l'utilisateur courant et son profil.
- `requireAuth()` : impose une session connectee.
- `hasTableRole(tableId, role?)` : verifie l'appartenance et optionnellement un role.
- `requireTableRole(tableId, role?)` : bloque si le role n'est pas present.

## Membership

Le controle fin passe par `table_memberships`. Un utilisateur doit etre membre d'une table pour acceder aux donnees metier de cette table.

Les services utilisent aussi `MembershipService.requireMembership()` pour centraliser les controles.

## Roles

- `gm` : Maître du Jeu. Peut administrer les invitations, membres, sessions et modules live selon les services.
- `player` : joueur membre de la table.
- `observer` : observateur membre, avec acces plus limite cote produit.
- `owner_id` : proprietaire/createur de table. Ce n'est pas une valeur de l'enum `table_role`, mais un champ de `tables` utilise notamment pour certains droits de suppression.

## Principe de securite

Les controles importants doivent rester cote serveur : route handlers, services et RLS Supabase. L'interface peut masquer des actions, mais ne doit jamais etre consideree comme une barriere de securite.
