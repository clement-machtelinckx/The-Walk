# Dette technique — base de travail Codex

> Document de pilotage pour les petites passes de réduction de dette sur **The-Walk**.  
> À utiliser comme **fil rouge** quand Codex intervient sur le code.

---

## Objectif

Réduire progressivement la dette technique visible dans SonarQube sans lancer de gros chantiers inutiles.

Ce document sert à :

- prioriser les fixes à faible risque ;
- éviter de mélanger mini-fix et refacto lourde ;
- donner à Codex une ligne claire sur ce qu'il peut corriger rapidement ;
- garder une trace des zones du projet qui accumulent du bruit Sonar.

---

## Snapshot de référence

Source : export / relevé SonarQube fourni manuellement.

- **222 issues ouvertes**
- **1 jour 1 heure d'effort estimé**

Le bruit observé est surtout concentré sur :

- cohérence React / TypeScript ;
- lisibilité ;
- assertions redondantes dans les tests ;
- petites conventions Node / ES2020 ;
- quelques issues plus structurantes à traiter plus tard.

---

## Règle générale de traitement

### À faire en priorité
Ce que Codex peut corriger sans risque élevé :

- props de composants à passer en `Readonly<...>` ;
- assertions inutiles dans les tests ;
- conditions triviales à rendre plus lisibles ;
- optional chaining quand le gain de lisibilité est évident ;
- variables / props inutilisées quand le fix est trivial ;
- `window` remplacé par `globalThis` si le changement est purement mécanique ;
- imports `crypto` → `node:crypto` quand c'est seulement une convention ;
- `useState` mal destructuré quand le fix est purement mécanique.

### À traiter avec prudence
Peut être corrigé, mais seulement si le changement reste court et très lisible :

- nested ternaries à extraire en variable intermédiaire ;
- petites améliorations d'accessibilité sans refonte UI ;
- petites optimisations React locales.

### À reporter
Ne pas lancer ça dans une mini-passe dette :

- refacto auth ;
- génération des login tokens ;
- sécurité crypto ;
- permissions / RLS ;
- migrations DB ;
- gros sujets perf ;
- refontes UI ;
- refacto d'architecture.

---

## Catégories d'issues repérées

### 1. Props React à passer en `Readonly<...>`
C'est la catégorie la plus répétitive et la plus simple à faire tomber.

Fichiers touchés dans le relevé :

- `app/.../mon-compte/_components/profile-content.tsx`
- `app/.../session/live/[sessionId]/page.tsx`
- `app/.../tables/[tableId]/session/next/page.tsx`
- `app/.../group-invitation/[token]/page.tsx`
- `app/(pages)/(public)/login/page.tsx`
- `app/(pages)/(public)/register/page.tsx`
- `app/error.tsx`
- de nombreux composants dans :
  - `components/admin/`
  - `components/auth/`
  - `components/layout/`
  - `components/session/`
  - `components/special/`
  - `components/table/`
  - `components/ui/`

**Statut recommandé : quick win.**

---

### 2. Assertions redondantes dans les tests
Très présent dans les routes, services et repositories.

Exemples vus dans le relevé :

- `app/api/invitations/[token]/accept/route.test.ts`
- `app/api/sessions/[sessionId]/modules/route.test.ts`
- `app/api/sessions/[sessionId]/start/route.test.ts`
- `app/.../[tableId]/private-messages/route.test.ts`
- `lib/auth/server.test.ts`
- `lib/db/index.test.ts`
- `lib/repositories/_shared/base.test.ts`
- `lib/repositories/private-message-repository.test.ts`
- plusieurs tests dans :
  - `lib/services/dice/`
  - `lib/services/invitations/`
  - `lib/services/memberships/`

**Statut recommandé : quick win.**

---

### 3. Nested ternaries et lisibilité
Plusieurs composants ont des ternaires imbriqués jugés confus par Sonar.

Exemples notables :

- `components/admin/invitation-manager.tsx`
- `components/notifications/notification-center.tsx`
- `components/profile/email-usage-card.tsx`
- `components/session/livechat-block.tsx`
- `components/session/personal-note-block.tsx`
- `components/session/player-presence-panel.tsx`
- `components/session/prechat-block.tsx`
- `components/session/private-conversation-panel.tsx`
- `components/session/session-form.tsx`
- `components/session/session-tools-drawer.tsx`
- `components/special/group-invitation-accept-button.tsx`
- `components/special/page-error-state.tsx`
- `components/table/table-card.tsx`

**Statut recommandé : à corriger seulement si l'extraction reste simple.**

---

### 4. Conditions négatives / optional chaining / petits smells de lisibilité
Exemples remontés :

- `components/admin/group-invitation-panel.tsx`
- `components/ui/form.tsx`
- `components/admin/next-session-admin-block.tsx`
- `lib/repositories/invitation-repository.ts`

**Statut recommandé : quick win si le gain est immédiat.**

---

### 5. Accessibilité mineure à corriger sans refonte
Exemples :

- `components/session/next-session-container.tsx`
  - préférer `<output>` au rôle `status`
- `components/ui/carousel.tsx`
  - préférer certains éléments HTML sémantiques à des rôles génériques

**Statut recommandé : à faire au cas par cas, si la correction est courte.**

---

### 6. Contexte React / value recréée à chaque render
Exemples :

- `components/auth/auth-provider.tsx`
- `components/ui/carousel.tsx`
- `components/ui/form.tsx`

Ces issues peuvent être légitimes, mais elles touchent au comportement React.

**Statut recommandé : à traiter séparément, pas dans une mini-passe dette si on manque de temps.**

---

### 7. Conventions runtime / plateforme
Exemples :

- `components/ui/reveal.tsx`
  - préférer `globalThis` à `window`
- `lib/repositories/group-invitation-repository.ts`
- `lib/repositories/invitation-repository.ts`
- `lib/repositories/login-token-repository.ts`
  - préférer `node:crypto` à `crypto`

**Statut recommandé : quick win.**

---

## Fichiers les plus “bruyants”

### Pôle session / live
Beaucoup d'issues se concentrent dans :

- `components/session/session-tools-drawer.tsx`
- `components/session/player-presence-panel.tsx`
- `components/session/livechat-block.tsx`
- `components/session/prechat-block.tsx`
- `components/session/presence-block.tsx`
- `components/session/private-conversation-panel.tsx`
- `components/session/session-form.tsx`

### Pôle notifications / profile / admin
- `components/notifications/notification-center.tsx`
- `components/profile/email-usage-card.tsx`
- `components/admin/invitation-manager.tsx`
- `components/admin/group-invitation-panel.tsx`
- `components/admin/next-session-admin-block.tsx`

### Pôle tests
- `app/api/.../*.test.ts`
- `lib/services/.../*.test.ts`
- `lib/repositories/...*.test.ts`

---

## Ordre conseillé pour les prochaines passes

### Passe 1 — ultra rapide
Objectif : faire tomber le bruit mécanique.

- `Readonly<...>` sur les props ;
- assertions redondantes ;
- imports `node:crypto` ;
- `globalThis` au lieu de `window` ;
- props / variables inutilisées triviales.

### Passe 2 — lisibilité légère
Objectif : nettoyer sans refacto.

- optional chaining simples ;
- conditions négatives simples ;
- nested ternaries les plus courts.

### Passe 3 — sujets à arbitrer
Seulement si on a du temps et qu'on veut aller plus loin.

- value de Context provider à memoïser ;
- micro-améliorations accessibilité ;
- composants un peu trop verbeux.

### Passe 4 — hors mini-fix
À planifier à part.

- sécurité / tokens ;
- auth plus profonde ;
- performance React ;
- refacto live hub ;
- dette structurelle.

---

## Règles pour Codex quand il traite cette dette

1. Toujours privilégier les fixes :
   - locaux ;
   - mécaniques ;
   - à faible risque ;
   - sans impact produit.

2. Ne pas ouvrir de chantier caché.

3. Ne pas corriger une issue Sonar si la correction :
   - rend le code moins lisible ;
   - change le comportement ;
   - impose une migration ;
   - déclenche une refonte.

4. Quand plusieurs issues similaires existent, corriger par lots cohérents :
   - toutes les props `Readonly` d'une zone ;
   - toutes les assertions redondantes d'un groupe de tests ;
   - puis relancer lint + tests.

5. En fin de passe, toujours indiquer :
   - catégories d'issues corrigées ;
   - issues laissées de côté ;
   - fichiers touchés ;
   - résultat `npm run lint` ;
   - résultat `npm run test`.

---

## Sujets explicitement exclus pour l'instant

Ces sujets ne doivent pas être traités dans une simple passe dette courte :

- génération sécurisée des login tokens ;
- remplacement de `Math.random()` ;
- refonte auth ;
- refonte permissions ;
- migrations DB ;
- gros sujets accessibilité ;
- gros sujets perf ;
- refacto massive du live.

---

## Mise à jour du document

Quand une grosse catégorie d'issues a été traitée, ce fichier doit être mis à jour pour :

- retirer les catégories déjà bien nettoyées ;
- marquer les sujets encore ouverts ;
- garder une vue claire de la dette restante.

---

## Résumé exécutif

Ce fichier sert à garder une approche saine :

- **d'abord les quick wins**
- **ensuite la lisibilité**
- **ensuite les vrais sujets**
- **jamais de gros chantier caché sous prétexte de “faire plaisir à Sonar”**
