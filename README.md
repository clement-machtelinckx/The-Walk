# The-Walk — Gestion de sessions JDR

Application métier privée pour la gestion de tables et de sessions de jeu de rôle.

## Stack Technique

- **Framework** : Next.js 15+ (App Router, Server Components)
- **Langage** : TypeScript
- **Style** : TailwindCSS 4, shadcn/ui
- **Backend/DB** : Supabase (PostgreSQL, Auth, RLS)
- **Validation** : Zod

## Architecture Auth

Le projet utilise **Supabase Auth** pour la gestion des sessions.

### Modèle de données
- `auth.users` : Identifiants techniques gérés par Supabase.
- `public.profiles` : Profils métier synchronisés via trigger SQL.

### Composants Clés
- `lib/auth/server.ts` : Helpers serveur (`getCurrentUser`, `requireAuth`).
- `lib/supabase/middleware.ts` : Refresh de session et protection des routes.
- `components/auth/auth-provider.tsx` : État auth côté client (React Context).
- `app/api/auth/` : Route handlers pour le bridge login/register/logout.

## Debug Auth & Local Dev

### Concepts Auth
- **auth.users** : Comptes d'authentification gérés par Supabase (Email, Password, Metadata).
- **public.profiles** : Profils applicatifs The-Walk liés à `auth.users` par leur `id`.
- Un trigger SQL (`on_auth_user_created`) crée automatiquement un profil dans `public.profiles` lors de chaque inscription.

### Environnement local vs Cloud
- L'application utilise les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Pour pointer sur le local : assurez-vous que `npx supabase start` est lancé.
- Pour récupérer les variables locales : `npx supabase status -o env`.

### Vérification après Inscription (Register)
Si un utilisateur ne peut pas se connecter après inscription, vérifiez dans l'interface Supabase (ou via SQL) :
1. Que l'utilisateur existe dans la table `auth.users`.
2. Qu'une ligne correspondante (même ID) existe dans `public.profiles`.
3. Si le profil manque, vérifiez les logs de fonctions/triggers dans Supabase.

### Commandes utiles (Supabase CLI)
```bash
npx supabase db reset      # Réinitialise la DB locale et applique les migrations (V1)
npx supabase status        # Affiche l'état des services et les URLs
```

## Installation

1. Cloner le repo
2. `npm install`
3. Copier `.env.example` en `.env.local` et remplir les clés Supabase.
4. `npm run dev`

## Développement

```bash
npm run dev      # Serveur de dev (Next.js)
npm run lint     # Linting
npm run build    # Build de production
```
