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
