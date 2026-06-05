# Points a raconter

## Probleme adresse

Une table JDR a besoin de coordonner joueurs, sessions, presence, messages et outils de jeu. The-Walk centralise ces elements dans un espace prive oriente table.

## Choix techniques

- Next.js App Router pour combiner pages, Server Components et route handlers.
- Supabase pour auth, base Postgres, migrations et RLS.
- Services/repositories pour separer logique metier et persistance.
- Zod pour valider les entrees.
- Tailwind et composants UI reutilisables pour aller vite sans multiplier les styles ad hoc.

## Arbitrages produit

- V1 simple et orientee usages principaux.
- Permissions serveur avant confort client.
- Notifications globales plutot que signaux disperses.
- Outils de session regroupes dans un drawer pour garder le live lisible.

## Etat actuel

Le socle couvre les tables, les membres, les invitations, les sessions, le live, les notes, les messages, les des, les notifications et les emails transactionnels.

## Perspectives

- Consolider les tests sur les parcours critiques.
- Ameliorer l'experience mobile live.
- Documenter les audits au fil de l'eau.
- Enrichir les outils live avances sans basculer vers un VTT complet.

## Points a assumer

- Le decoupage entre version stabilisee et phase suivante n'est pas encore fige.
- Le drawing collaboratif est une piste forte, mais la phase suivante couvre plus largement les outils de jeu et l'enrichissement du live.
- Le role `observer`, les tests end-to-end et l'exploitation production restent a consolider.
