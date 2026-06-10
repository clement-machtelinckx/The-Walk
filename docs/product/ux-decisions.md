# Decisions UX et produit

## Mobile-first pragmatique

Les interfaces sont pensees pour rester utilisables sur mobile : navigation simple, panels, sheets et composants compacts.

## Centre de notifications global

Les evenements importants sont regroupes dans un centre accessible depuis l'en-tete, pour eviter de disperser les signaux dans chaque page.

## Page table comme hub avant-session

La planification, les RSVP, leur synthese et la discussion avant le jeu sont regroupes dans le bloc Prochaine session de la page table. La route dediee historique redirige vers ce hub et n'est plus un point d'entree produit.

## Drawer d'outils session

La session live regroupe les outils dans un drawer : joueurs/presence, jets de des, options avancees et outils MJ. Cela garde la page live lisible tout en conservant les outils disponibles.

## Simplicite V1

La V1 privilegie des flux explicites : table, membres, prochaine session, live session. Les automatisations restent limitees aux endroits utiles, comme notifications et emails non bloquants.

## Securite invisible

L'UI masque les actions selon le role, mais les decisions sensibles restent cote serveur. Cette approche evite de faire porter la securite aux composants client.

## Soutenance

Les parcours a montrer doivent rester courts : creation/administration de table, invitation, planification de session, demarrage live, outils de session, notifications.

## Roadmap non figee

La roadmap distingue l'existant, la consolidation et les extensions futures. Le drawing collaboratif reste une piste d'outil live avance, pas le seul axe d'une phase suivante.
