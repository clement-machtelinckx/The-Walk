# Notifications

## Modele

Les notifications in-app sont stockees dans `notifications` :

- `user_id` : destinataire.
- `type` : type fonctionnel.
- `title`, `body` : contenu affiche.
- `resource_type`, `resource_id`, `href` : contexte et navigation.
- `data` : metadata JSON.
- `is_read`, `read_at` : etat de lecture.

## Centre global

`components/notifications/notification-center.tsx` affiche un centre global dans l'en-tete applicatif. Il permet de :

- consulter les dernieres notifications ;
- voir le compteur non lu ;
- marquer une notification comme lue ;
- marquer toutes les notifications comme lues ;
- naviguer vers le lien associe si disponible.

## Evenements branches

`NotificationEventService` cree deja des notifications pour :

- invitation ciblee recue, si l'email correspond a un profil existant ;
- prochaine session planifiee ;
- message prive recu ;
- session live demarree.
- initiative demandee aux joueurs presents, ou a defaut aux joueurs de la table.

## Limites actuelles

- Pas de temps reel WebSocket cote notification globale : le compteur est recupere via API.
- Les creations d'evenements sont non bloquantes sur certains flux : une erreur de notification ne doit pas casser l'action principale.
- Les types de notifications sont des chaines controlees par le code, pas encore une enum SQL stricte.
- Les tests doivent encore couvrir plus largement les routes et evenements de notification.
