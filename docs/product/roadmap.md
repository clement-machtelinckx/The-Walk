# Roadmap produit

Cette roadmap distingue l'etat reel du projet, les points a stabiliser et les pistes futures.
Le decoupage V1/V2 n'est pas fige : il vaut mieux lire ce document par niveau de maturite.

## Statuts utilises

| Statut | Sens |
|---|---|
| `Done` | Present dans le repo et exploitable dans les parcours principaux. |
| `A consolider` | Present ou amorce, mais encore fragile, incomplet, peu teste ou a clarifier. |
| `A faire` | Non implemente a ce stade. |
| `A etudier` | Idee plausible, mais valeur produit ou cout technique a valider avant planification. |

## Fondations livrees

| Domaine | Statut | Notes |
|---|---|---|
| Base Next.js App Router, TypeScript et Supabase | `Done` | Pages publiques/protegees, route handlers, migrations et RLS. |
| Authentification et compte | `Done` | Inscription, connexion, deconnexion, changement de mot de passe, profil, avatars. |
| Tables et roles | `Done` | Creation, liste, detail, administration MJ, membres, roles `gm`, `player`, `observer`. |
| Invitations ciblees | `Done` | Invitation email, page publique d'acceptation, invitations en attente. |
| Invitations de groupe | `Done` | Lien partageable temporaire avec role choisi. |
| Sessions | `Done` | Prochaine session, RSVP, demarrage live, fin, annulation, suppression controlee, historique. |
| Presence | `Done` | Statuts de presence, resume et panneau joueurs. |
| Messages | `Done` | Discussion publique permanente de table avec contexte de session optionnel, et messages prives de table. |
| Notes | `Done` | Notes personnelles et notes de groupe, rattachees a table/session selon contexte. |
| Des | `Done` | Lancers serveur, persistance table, session optionnelle et journal live. |
| Modules live | `Done` | Enrichissements activables par session : notes, des, initiative et presence. |
| Drawer d'outils session | `Done` | Onglets joueurs/prive, des/initiative, avance et MJ. |
| Notifications in-app | `Done` | Centre global, compteur non lu, lecture unitaire, lecture globale. |
| Emails transactionnels | `Done` | Mailtrap/Brevo, logs, quota, invitations, confirmation d'inscription, rappel de session. |
| Etats d'erreur globaux | `Done` | `app/error.tsx`, `app/not-found.tsx` et fallbacks publics. |
| Documentation projet | `Done` | Dossier `docs/`, devlog, architecture, produit et soutenance. |

## Consolidation prioritaire

| Sujet | Statut | Pourquoi |
|---|---|---|
| Parcours live sur mobile | `A consolider` | Le live est fonctionnel, mais les modules et le drawer doivent rester confortables en usage reel. |
| Messages prives | `A consolider` | Le scope table est en place, mais l'UX reste simple et merite une validation en conditions live. |
| Role `observer` | `A consolider` | Le role existe, mais ses limites produit exactes doivent etre arbitrees et verifiees dans les services. |
| Initiative | `A consolider` | Le module est branche, mais le suivi d'ordre de tour reste un placeholder. |
| Notifications | `A consolider` | Le centre global fonctionne par API/polling, pas en temps reel. |
| Emails | `A consolider` | Les providers et logs existent ; il faut valider configuration, quotas et comportement en environnement cible. |
| Tests des flux critiques | `A consolider` | Plusieurs tests existent, mais les parcours complets table/session/live restent a couvrir davantage. |
| Permissions serveur et RLS | `A consolider` | Les controles sont presents, mais une revue systematique reste necessaire avant livraison. |
| Accessibilite et mobile reel | `A consolider` | Les interfaces sont mobile-first, mais une passe RGAA et tests appareils restent a faire. |
| Documentation d'exploitation | `A consolider` | La doc projet existe ; deploiement, exploitation et incident restent a documenter si production. |

## A faire pour une version stabilisee

| Sujet | Statut | Notes |
|---|---|---|
| CI GitHub Actions | `A faire` | Lint, tests et build automatiques sur pull request. |
| Rapport de coverage exploitable | `A faire` | Utile pour soutenance et suivi qualite. |
| Audit securite OWASP/RLS | `A faire` | Verifier permissions, invitations, routes sensibles et service role. |
| Rate limiting routes sensibles | `A faire` | Un helper existe, mais l'application systematique reste a verifier/brancher. |
| Cahier de recette | `A faire` | Parcours attendus, resultats, comptes de test, anomalies connues. |
| Manuel de deploiement | `A faire` | Variables, Supabase, providers email, migration, verification post-deploiement. |
| Manuel utilisateur court | `A faire` | Parcours MJ et joueur pour reprise ou demo. |
| Registre des risques | `A faire` | Risques produit, securite, donnees, soutenance, exploitation. |
| Templates issues / anomalies | `A faire` | Standardiser les retours bug et les corrections. |
| Endpoint health | `A faire` | Suivi minimal de disponibilite si deploiement. |
| Monitoring erreurs | `A faire` | Sentry ou equivalent a evaluer selon contexte de livraison. |

## Outils live avances

Cette phase regroupe les enrichissements de jeu. Le dessin n'est qu'un outil possible parmi d'autres.

| Sujet | Statut | Notes |
|---|---|---|
| Suivi d'initiative complet | `A faire` | Ordre de tour, edition MJ, affichage compact live. |
| Notes rapides MJ | `A faire` | Capturer une idee ou un evenement sans quitter le live. |
| Resume rapide de fin de session | `A faire` | Transformer les notes/messages en trace lisible. |
| Timeline ou historique enrichi | `A faire` | Mettre en valeur evenements, notes importantes, des et decisions. |
| Drawing collaboratif simple | `A faire` | Tableau blanc mobile-first, sauvegarde session, permissions MJ/joueurs. |
| Ambiances sonores simples | `A etudier` | Valeur a valider ; attention droits, stockage et bande passante. |
| Personnages de table agnostiques | `A etudier` | Utile si cela reste simple et non lie a un systeme de regles precis. |
| Outils d'improvisation MJ | `A etudier` | Noms, PNJ, lieux, marqueurs de scene ; a prioriser apres usage reel. |
| QR code ou acces rapide session | `A etudier` | Peut reduire la friction si les tests terrain le confirment. |

## Extensions produit futures

| Sujet | Statut | Notes |
|---|---|---|
| Notifications temps reel | `A etudier` | Pertinent si le polling devient insuffisant. |
| Exports Markdown/PDF | `A etudier` | Utile pour compte rendu, soutenance ou historique de campagne. |
| Recherche dans notes/historique | `A etudier` | A prioriser si le volume de donnees augmente. |
| Stockage fichiers | `A etudier` | Necessaire pour drawing, images ou exports persistants. |
| Beta fermee | `A etudier` | A lancer apres stabilisation des parcours et de la doc d'exploitation. |
| Hypothese premium | `A etudier` | Trop tot pour figer ; a valider par usages reels. |

## Jalons de lecture

1. Stabiliser les parcours actuels : mobile live, permissions, tests, emails, notifications.
2. Rendre le projet presentable : cahier de recette, audits, coverage, plan de demo, docs d'exploitation minimales.
3. Ajouter les outils live avances les plus utiles : initiative, notes rapides, historique enrichi.
4. Etudier les extensions plus ambitieuses : drawing, ambiances, personnages, exports, beta.

## Ce qui n'est pas encore arbitre

- Frontiere exacte entre version stabilisee et phase suivante.
- Niveau d'ambition du drawing collaboratif.
- Profondeur du role `observer`.
- Necessite d'un vrai temps reel pour notifications et modules live.
- Perimetre d'une eventuelle beta fermee.
