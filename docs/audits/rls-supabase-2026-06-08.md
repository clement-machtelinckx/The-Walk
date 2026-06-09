# Audit RLS Supabase - 2026-06-08

## 1. Vue d'ensemble

### Portee et methode

Audit statique des migrations, repositories, services, routes API et helpers d'authentification,
complete par une lecture du catalogue PostgreSQL de l'instance Supabase locale.

- 18 tables applicatives auditees.
- 9 tables avec RLS activee.
- 9 tables sans RLS.
- 25 policies presentes.
- Aucune table n'utilise `FORCE ROW LEVEL SECURITY`.
- Les roles `anon` et `authenticated` disposent localement de tous les privileges de table
  Supabase par defaut. Sur une table sans RLS, les lectures et ecritures sont donc directement
  autorisees via l'API Supabase.

Cet audit confirme l'etat applique sur l'instance locale le 8 juin 2026. Il ne confirme pas
l'etat d'un projet Supabase distant de production, auquel aucun acces n'a ete utilise.

### Impression generale

La couche applicative est globalement structuree correctement : les routes imposent
l'authentification, les services verifient l'appartenance, et les actions d'administration sont
souvent reservees au GM. Cette protection n'est toutefois pas suffisante face a un appel direct a
l'API Supabase.

L'etat RLS actuel n'est pas pret pour la production. L'absence de RLS sur `table_memberships`
permet de contourner presque toutes les policies fondees sur l'appartenance et le role GM.
L'absence de RLS sur `invitations` permet egalement de lire et modifier des tokens, emails, roles
et statuts d'invitation. Les messages, presences, RSVP et notes historiques sont eux aussi ouverts.

### Tables critiques

| Zone             | Tables                                                                   | Etat                                                                   |
| ---------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Auth / profil    | `profiles`, `login_tokens`                                               | RLS activee, mais updates de profil trop larges                        |
| Tables / membres | `tables`, `table_memberships`                                            | Critique : memberships sans RLS                                        |
| Invitations      | `invitations`, `table_group_invitations`                                 | Critique : invitations ciblees ouvertes et liens de groupe enumerables |
| Sessions / live  | `sessions`, `session_responses`, `session_presence`, chats, modules, des | Protection heterogene; plusieurs tables live sans RLS                  |
| Messages prives  | `table_private_messages`                                                 | Policy coherente, neutralisee si memberships compromis                 |
| Notifications    | `notifications`                                                          | Isolation correcte, update trop large                                  |
| Logs email       | `email_delivery_logs`                                                    | Deny-all client et service role coherent                               |

## 2. Audit table par table

Les droits indiques sont les droits DB reels, pas seulement les controles des services.

### `profiles`

- **RLS :** activee.
- **Policies :** lecture de soi; lecture des membres partageant une table; lecture du createur de
  toute invitation de groupe active; update de soi.
- **Read :** soi, profils partageant une table, et tout profil ayant cree une invitation de groupe
  non expiree. La derniere policy s'applique aussi a `anon` et ne verifie pas la possession d'un
  token.
- **Insert :** aucun acces client; creation par le trigger `handle_new_user()` en
  `SECURITY DEFINER`.
- **Update :** un utilisateur peut modifier sa propre ligne, sans restriction de colonnes RLS.
- **Delete :** aucun acces client.
- **Service role :** utilise par `ProfileRepository.getByEmailForSystem()` pour les notifications.
- **Risque : important.** L'app ne modifie que `avatar_key`, mais un appel direct peut modifier
  `email`, `display_name` et `avatar_url`. La policy d'invitation expose publiquement certains
  profils.

### `tables`

- **RLS :** activee.
- **Policies :** lecture membre; lecture owner; lecture si une invitation de groupe active existe;
  insert par owner; update owner ou GM; delete owner.
- **Read :** membres, owner, et n'importe qui lorsqu'une invitation de groupe active existe.
- **Insert :** utilisateur authentifie si `owner_id = auth.uid()`.
- **Update :** owner ou GM, sur toutes les colonnes.
- **Delete :** owner uniquement.
- **Service role :** utilise pour afficher le nom d'une table depuis une invitation ciblee.
- **Risque : critique.** Un GM peut modifier directement `owner_id`, se designer owner puis
  supprimer la table. L'app ne permet que `name` et `description`, mais la RLS ne garantit pas
  cette restriction. Toute table avec lien de groupe actif est lisible publiquement.

### `table_memberships`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated` selon les privileges
  Supabase appliques.
- **Service role :** non necessaire.
- **Risque : critique.** Un utilisateur peut s'ajouter a une table, se promouvoir GM, changer les
  roles d'autres membres ou supprimer des memberships. Cette table sert de racine de confiance a
  presque toutes les autres policies; sa compromission neutralise leur isolation.

### `sessions`

- **RLS :** activee.
- **Policies :** lecture membre; insert/update/delete GM.
- **Read :** tout membre de la table, tous roles confondus.
- **Insert / update / delete :** GM de la table.
- **Service role :** non.
- **Risque : important.** Coherent avec les services, sauf que l'update DB autorise toutes les
  colonnes et qu'un GM peut deplacer une session vers une autre table dont il est GM. La securite
  depend entierement de `table_memberships`, actuellement ouverte.

### `session_responses`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** L'app permet aux membres de lire les RSVP et a chacun de modifier sa
  reponse. La DB permet de lire ou falsifier les reponses de n'importe quel utilisateur.

### `session_presence`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** L'app reserve l'enregistrement de l'appel au GM pendant une session
  active. La DB permet a tous de falsifier ou supprimer les presences.

### `invitations`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** utilise seulement pour le fallback de lecture des informations de table, pas
  pour gerer l'invitation.
- **Risque : critique.** Emails et tokens sont publiquement lisibles. Un appel direct peut creer ou
  modifier une invitation, choisir le role `gm`, changer l'email cible, le token ou le statut, puis
  contourner les controles du service d'acceptation.

### `table_group_invitations`

- **RLS :** activee.
- **Policies :** `SELECT using (true)`; gestion complete par GM.
- **Read :** toutes les lignes et tous les tokens sont lisibles par tout le monde, y compris
  `anon`. Le nom de policy "by token" ne correspond pas a son effet.
- **Insert / update / delete :** GM de la table.
- **Service role :** non.
- **Risque : critique.** Les liens secrets sont enumerables. Comme un lien peut attribuer le role
  `gm`, une invitation GM active peut permettre une escalade immediate. Meme sans ce cas,
  `table_memberships` ouverte permet de satisfaire la policy GM.

### `pre_session_messages`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** L'app limite lecture et envoi aux membres, mais la DB expose et autorise la
  modification/suppression de tous les messages.

### `live_session_messages`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** L'app reserve l'envoi aux membres pendant une session active; la DB ne
  verifie ni appartenance, ni auteur, ni statut de session.

### `personal_notes`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** Des notes explicitement personnelles sont lisibles et modifiables par
  tous. C'est une fuite de confidentialite directe.

### `group_notes`

- **RLS :** non activee.
- **Policies :** aucune.
- **Read / insert / update / delete :** ouverts a `anon` et `authenticated`.
- **Service role :** non.
- **Risque : critique.** Le produit autorise lecture et edition aux membres uniquement; la DB les
  ouvre a tous.

### `table_private_messages`

- **RLS :** activee.
- **Policies :** lecture par les deux participants encore membres; insert par l'expediteur si les
  deux utilisateurs sont membres et si la session optionnelle appartient a la table.
- **Read :** expediteur ou destinataire, tant qu'il est encore membre de la table.
- **Insert :** expediteur authentifie vers un autre membre de la meme table.
- **Update / delete :** aucun acces client; messages immuables.
- **Service role :** non.
- **Risque : important par dependance.** La policy elle-meme est saine et plus stricte que beaucoup
  d'autres. Elle devient contournable tant que `table_memberships` est modifiable sans RLS.

### `email_delivery_logs`

- **RLS :** activee.
- **Policies :** aucune, donc deny-all pour les clients.
- **Read / insert / update / delete :** aucun acces `anon` ou `authenticated` malgre leurs grants.
- **Service role :** oui, volontairement, pour creation et calcul des quotas.
- **Risque : faible.** Modele coherent pour des logs sensibles. La route d'usage authentifiee passe
  par un service qui requiert l'utilisateur courant avant les lectures privilegiees.

### `notifications`

- **RLS :** activee.
- **Policies :** lecture de ses notifications; update de ses notifications.
- **Read :** proprietaire uniquement.
- **Insert :** aucun acces client; creation par service role.
- **Update :** proprietaire, sur toutes les colonnes tant que `user_id` reste le sien.
- **Delete :** aucun acces client.
- **Service role :** oui, volontairement, pour creer des notifications systeme.
- **Risque : important.** Isolation inter-utilisateur correcte, mais l'app ne modifie que l'etat de
  lecture alors que la DB permet au proprietaire de falsifier titre, lien, type et metadata.

### `session_live_enabled_modules`

- **RLS :** activee.
- **Policies :** lecture membre; insert/delete GM.
- **Read :** tous les membres.
- **Insert / delete :** GM.
- **Update :** aucun acces client.
- **Service role :** non.
- **Risque : important par dependance.** Coherent avec l'app, mais repose sur
  `table_memberships`. La contrainte de cle autorise aussi des modules futurs non connus de l'app;
  le service conserve volontairement ces cles.

### `session_dice_rolls`

- **RLS :** activee.
- **Policies :** lecture membre; insert par le membre pour son propre `user_id`.
- **Read :** tous les membres de la table.
- **Insert :** membre, avec `user_id = auth.uid()`.
- **Update / delete :** aucun acces client; journal immutable.
- **Service role :** non.
- **Risque : important.** La policy ne verifie pas que `session_id`, lorsqu'il est fourni,
  appartient a `table_id`; le service le verifie, mais un appel direct peut creer une association
  incoherente. La policy depend aussi de memberships non proteges.

### `login_tokens`

- **RLS :** activee.
- **Policies :** aucune, donc deny-all pour les clients.
- **Read / insert / update / delete :** aucun acces `anon` ou `authenticated`.
- **Service role :** oui, volontairement, pour creer, verifier et consommer les tokens.
- **Risque : faible.** Separation correcte. Le generateur de token utilise toutefois
  `Math.random()` et merite une revue cryptographique distincte de l'audit RLS.

## 3. Incoherences detectees

### Problemes confirmes

1. **Appartenance et roles contournables en DB.** Les services protegent les actions GM, mais
   `table_memberships` sans RLS autorise l'auto-ajout, la promotion GM et la suppression directe.
2. **Donnees privees ouvertes.** RSVP, presence, pre-chat, live chat, notes personnelles et notes
   de groupe n'ont pas de RLS.
3. **Invitations ciblees ouvertes.** L'app verifie le GM et l'email cible; la DB autorise tous les
   CRUD et expose les tokens/emails.
4. **Liens de groupe enumerables.** `SELECT using (true)` signifie "lire toutes les invitations",
   pas "lire uniquement si le token est connu".
5. **Escalade owner par un GM.** La policy d'update de `tables` permet de modifier `owner_id`, alors
   que l'app ne l'expose pas.
6. **Updates plus larges que l'app.** `profiles` et `notifications` autorisent en DB la modification
   de colonnes que les routes ne permettent pas de changer.
7. **Policies publiques par defaut.** Toutes les policies sont creees pour le role implicite
   `public`; certaines expressions sans `auth.uid()` ouvrent donc reellement des lectures a
   `anon`.

### Risques probables / zones floues

- **Role `observer`.** Le code ne definit presque aucune limitation specifique. Un observer est
  traite comme tout membre pour chats, RSVP, notes de groupe, des, presences lues et messages
  prives. Seules les actions GM lui sont refusees. Ce comportement doit etre confirme par le
  produit avant d'ecrire les policies finales.
- **Invitations avec role GM.** Les validateurs et interfaces autorisent `gm` pour les invitations
  ciblees et de groupe. Il faut confirmer que la delegation GM par lien est voulue.
- **Membre retire et historique.** Les messages prives ne sont plus lisibles apres retrait de la
  table. Il faut confirmer si l'historique personnel doit rester accessible.
- **Owner non-GM.** `owner_id` et le role GM sont deux concepts separes. Un owner retire des
  memberships garde des droits de lecture/update/delete sur `tables`, mais pas sur les sessions ou
  autres donnees. La politique produit de ce cas n'est pas explicite.
- **Etat distant.** L'instance locale correspond aux migrations relues; l'etat du futur projet de
  production doit etre compare avant lancement.

### Dependances implicites au service role

- **Attendues et justifiees :** `login_tokens`, `email_delivery_logs`, creation de `notifications`,
  recherche systeme d'un profil par email.
- **Fallback discutable :** lecture du nom/description d'une table pour une invitation ciblee.
- **Non dependantes mais insuffisamment protegees :** invitations, memberships, messages, notes,
  RSVP et presence utilisent le client utilisateur et comptent sur les services plutot que la DB.

## 4. Risques avant prod

### Critique - bloquants avant production

- Activer et definir la RLS de `table_memberships`.
- Activer et definir la RLS de `invitations`.
- Activer et definir la RLS de `personal_notes`, `group_notes`, `pre_session_messages`,
  `live_session_messages`, `session_responses` et `session_presence`.
- Remplacer la lecture publique globale de `table_group_invitations`.
- Empecher la modification directe de `tables.owner_id` par les GM.

Une mise en production dans cet etat permettrait a un client utilisant la cle publique Supabase de
lire des donnees privees et d'obtenir des droits GM sans passer par l'interface.

### Important

- Restreindre les updates de `profiles` aux colonnes produit autorisees.
- Restreindre les updates de `notifications` a `is_read` / `read_at`, ou passer par une RPC ciblee.
- Ajouter la coherence DB entre `session_dice_rolls.session_id` et `table_id`.
- Clarifier les droits `observer`, owner et les invitations attribuant le role GM.
- Tester explicitement les policies avec des identites anon, membre, observer, player, GM et
  non-membre.

### Confort / amelioration

- Cibler explicitement `TO authenticated` ou `TO anon` dans chaque policy.
- Revoquer les privileges non necessaires, en complement de la RLS.
- Revoquer `EXECUTE` public sur les fonctions qui ne doivent servir que de triggers.
- Evaluer `FORCE ROW LEVEL SECURITY` selon le modele d'exploitation.
- Ajouter une verification automatique de couverture RLS dans la CI.

## 5. Recommandations

### A corriger avant prod

1. Ajouter une nouvelle migration de hardening, sans reecrire les migrations historiques.
2. Commencer par `table_memberships`, car cette table est la racine de confiance. Utiliser des
   helpers `SECURITY DEFINER` soigneusement limites si necessaire pour eviter les recursions RLS.
3. Proteger ensuite les invitations et les tables de contenu actuellement sans RLS.
4. Remplacer l'acces public aux invitations par une RPC ou une fonction serveur recevant le token,
   plutot que par une policy `using (true)`.
5. Retirer `owner_id` de la surface d'update directe ou imposer qu'il reste inchange.
6. Ajouter des tests d'integration RLS qui appellent directement Supabase, pas seulement les routes
   Next.js.
7. Comparer `pg_class`, `pg_policies` et les grants sur le projet Supabase de production juste
   avant le lancement.

### Peut attendre apres le blocage securite

- Durcir les colonnes modifiables de notifications.
- Revoir les privileges de fonctions et `FORCE RLS`.
- Revoir le generateur de `login_tokens`.
- Optimiser et factoriser les expressions de policies apres validation fonctionnelle.

### Points deja propres

- `login_tokens` et `email_delivery_logs` sont correctement fermes aux clients et volontairement
  utilises via service role.
- `table_private_messages` a une policy lisible et coherente avec les participants.
- `session_live_enabled_modules` reflete correctement le partage membre / administration GM.
- `session_dice_rolls` impose l'auteur et rend le journal immutable.
- Les routes API imposent systematiquement l'authentification sur les parcours metier sensibles.
- Les services expriment clairement les regles GM/membre et constituent une bonne reference pour
  ecrire les futures policies.

## 6. Fichiers relus

### Migrations

- `supabase/migrations/20260402000000_initial_schema.sql`
- `supabase/migrations/20260403000000_login_tokens.sql`
- `supabase/migrations/20260407000000_unique_notes.sql`
- `supabase/migrations/20260408000000_group_invitations.sql`
- `supabase/migrations/20260408010000_hardening_rls.sql`
- `supabase/migrations/20260408020000_fix_hardening_rls_regressions.sql`
- `supabase/migrations/20260601000000_session_dice_rolls.sql`
- `supabase/migrations/20260602000000_table_private_messages.sql`
- `supabase/migrations/20260603000000_email_delivery_logs.sql`
- `supabase/migrations/20260604000000_in_app_notifications.sql`
- `supabase/migrations/20260605000000_session_live_enabled_modules.sql`
- `supabase/migrations/20260606000000_profiles_avatar_key.sql`

### Code applicatif

- `lib/db/index.ts`, `lib/auth/server.ts`, `lib/supabase/server.ts`
- Les 15 repositories metier dans `lib/repositories/`
- Les services memberships, tables, sessions, responses, presence, invitations, prechat,
  livechat, notes, messages prives, des, notifications et email dans `lib/services/`
- Les validateurs dans `lib/validators/`
- Les 40 route handlers metier/auth concernes dans `app/api/`
- Les pages publiques d'invitation ciblee et d'invitation de groupe
- `docs/architecture/auth-and-permissions.md` et `docs/architecture/data-model.md`

## 7. Verifications effectuees

### Catalogue PostgreSQL local

Lecture de :

- `pg_class.relrowsecurity` et `relforcerowsecurity`;
- `pg_policies`;
- `information_schema.role_table_grants`;
- `information_schema.routines` et `role_routine_grants`;
- `information_schema.columns`.

Resultats principaux confirmes :

- 18 tables applicatives;
- 9 tables avec RLS;
- 9 tables sans RLS;
- 25 policies;
- grants complets pour `anon` et `authenticated` sur les tables publiques;
- 2 fonctions publiques, dont `handle_new_user()` en `SECURITY DEFINER`.

### Commandes

- `HOME=/tmp npx supabase status -o env` : instance locale accessible.
- `docker exec supabase_db_the-walk psql ...` : lecture du catalogue reel.
- `HOME=/tmp npx supabase db lint --local --level warning` : aucun schema error detecte.

Le linter Supabase ne signale pas l'absence de RLS comme une erreur de schema; son resultat ne
remet donc pas en cause les problemes confirmes ci-dessus.
