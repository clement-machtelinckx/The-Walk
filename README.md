# The-Walk

Application métier privée pour la gestion de sessions de jeu de rôle (JDR).

## Présentation

The-Walk est un hub centralisé permettant de gérer des tables de jeu, des sessions, des personnages et des ressources liées à l'univers du JDR. 
Cette application remplace l'ancien starter "Site Skeleton" et se concentre désormais sur des fonctionnalités applicatives privées.

## Stack technique

| Couche      | Technologie                                                 |
|-------------|-------------------------------------------------------------|
| Framework   | Next.js 15+ (App Router, React Server Components)           |
| UI          | React 19, TailwindCSS 4, shadcn/ui                          |
| State / DB  | Supabase (PostgreSQL, Realtime, Storage)                    |
| Auth        | Supabase Auth / NextAuth                                    |
| Formulaires | react-hook-form + Zod                                       |
| Icônes      | lucide-react                                                |
| Langage     | TypeScript 5                                                |

## Démarrage rapide

```bash
# Prérequis : Node.js >= 20
npm install
cp .env.example .env.local
# Remplissez les variables Supabase dans .env.local
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

## Scripts disponibles

| Commande        | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Serveur de dev (Turbopack) |
| `npm run build` | Build de production        |
| `npm start`     | Serveur de production      |
| `npm run lint`  | ESLint                     |

## Variables d’environnement

Créer un fichier `.env.local` à la racine :

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## Structure du projet

```text
app/
├── page.tsx                  # Tableau de bord (Home)
├── layout.tsx                # Layout racine
├── globals.css               # Styles globaux
├── robots.ts                 # robots.txt
└── sitemap.ts                # sitemap.xml

components/
├── ui/                       # Primitives shadcn/ui
├── layout/                   # Header, Footer, Container, Navigation
└── special/                  # Composants métier spécifiques

config/
└── site.ts                   # Configuration globale de l'application

lib/
└── utils.ts                  # Utilitaires (cn, etc.)
```

## État actuel

Le projet a été nettoyé de tous les éléments "vitrine" du starter initial (formulaires de contact, routes d'exemple, templates d'email).
La base est prête pour l'intégration de Supabase et le développement des fonctionnalités métier.
