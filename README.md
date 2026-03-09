# Site Skeleton

Starter Next.js réutilisable pour créer rapidement des sites vitrines modernes avec une architecture propre, des composants réutilisables et une base déjà câblée pour les formulaires et les emails.

Contenu par défaut en **français**.  
Ce dépôt est pensé pour être cloné puis adapté à chaque nouveau projet.

## Stack technique

| Couche      | Technologie                                                 |
|-------------|-------------------------------------------------------------|
| Framework   | Next.js 16 (App Router, React Server Components, Turbopack) |
| UI          | React 19, TailwindCSS 4, shadcn/ui (style New York)         |
| Formulaires | react-hook-form + Zod (validation partagée client/serveur)  |
| Icônes      | lucide-react                                                |
| Emails      | Nodemailer (SMTP)                                           |
| Langage     | TypeScript 5                                                |

## Démarrage rapide

```bash
# Prérequis : Node.js >= 20
npm install
cp .env.example .env.local
npm run dev
```

Le site sera disponible sur `http://localhost:3000`.

## Scripts disponibles

| Commande        | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Serveur de dev (Turbopack) |
| `npm run build` | Build de production        |
| `npm start`     | Serveur de production      |
| `npm run lint`  | ESLint                     |

> Aucun framework de test n’est configuré pour l’instant.

## Variables d’environnement

Créer un fichier `.env.local` à la racine :

```env
# SMTP (requis pour l'envoi d'emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=motdepasse

# Expéditeur des emails (requis)
MAIL_FROM="Site Skeleton <noreply@example.com>"

# Optionnel
MAIL_LOGO_URL=https://site-skeleton.com/logo-placeholder.svg
MAIL_FOOTER_TEXT=Site Skeleton — Tous droits réservés.
```

Les routes API (`/api/contact`, `/api/join`) renvoient une erreur explicite si les variables SMTP ou `MAIL_FROM` sont absentes.

## Structure du projet

```text
app/
├── page.tsx                  # Page d'accueil d'exemple
├── layout.tsx                # Layout racine (Header, Footer, Parallax)
├── globals.css               # Tokens CSS globaux
├── contact/                  # Page contact
│   └── form/                 # Page formulaire contact
├── api/
│   ├── contact/route.ts      # POST — formulaire contact → email
│   └── join/route.ts         # POST — candidature avec CV en pièce jointe
├── robots.ts                 # robots.txt dynamique
└── sitemap.ts                # sitemap.xml dynamique

components/
├── ui/                       # Primitives shadcn/ui (ne pas modifier à la main)
├── layout/                   # Header, Footer, Container, MenuBurger, ParallaxBackground
├── form/
│   ├── contact/              # Formulaire contact + schéma Zod
│   └── join/                 # Formulaire candidature + schéma Zod
└── special/                  # Composants optionnels / réutilisables conservés comme base

config/
├── site.ts                   # Configuration globale du site
└── contact.ts                # Coordonnées centralisées + helpers telHref/mailHref

lib/
├── mailer.ts                 # Transport Nodemailer (SMTP)
├── utils.ts                  # cn() — clsx + tailwind-merge
└── email-templates/
    ├── shared.ts             # Layout email HTML + utilitaires
    ├── contact.ts            # Template email contact
    └── join.ts               # Template email candidature
```

## Patterns clés

### Formulaires

Form component (`react-hook-form` + Zod resolver) → `POST /api/<endpoint>` → le serveur revalide les données → envoi email via Nodemailer → réponse JSON.

### Routage email générique

Le formulaire de contact peut router les emails vers différentes adresses selon le type de demande choisi.

### Anti-bot

Les formulaires incluent un champ honeypot `website` masqué.

### Upload fichier

Le formulaire de candidature accepte PDF/DOC/DOCX (max 5 Mo), envoyé en pièce jointe.

### Composants shadcn/ui

Les fichiers dans `components/ui/` sont générés. Pour ajouter un composant :

```bash
npx shadcn@latest add <component>
```

### Alias de chemin

`@/*` pointe vers la racine du projet (`tsconfig.json` + `components.json`).

## Comment réutiliser ce starter

### 1. Cloner le dépôt
```bash
git clone <url-du-repo> mon-nouveau-site
cd mon-nouveau-site
```

### 2. Changer le remote si nécessaire
```bash
git remote remove origin
git remote add origin <url-du-nouveau-repo>
```

### 3. Adapter la configuration
Modifier en priorité :
- `config/site.ts`
- `config/contact.ts`

### 4. Remplacer les placeholders
- logo
- favicon
- image Open Graph
- images dans `public/`
- textes d’exemple
- navigation
- metadata

### 5. Garder ou retirer les fonctionnalités utiles
Le starter contient volontairement plus que le strict minimum :
- formulaire de contact
- formulaire de candidature
- routes email
- composants réutilisables

Tu peux les conserver ou les retirer selon les besoins du site.

## Conseils d’usage

- Commencer par adapter la configuration globale avant de réécrire les pages.
- Garder les composants et formulaires génériques tant qu’ils peuvent resservir.
- Préférer commenter ou neutraliser certains anciens usages métier plutôt que supprimer trop tôt des mécaniques utiles.
- Utiliser ce dépôt comme base stable pour enchaîner plusieurs refontes de sites vitrines.

## TODO avant un usage production

- [ ] Remplacer les valeurs placeholder dans `config/site.ts`
- [ ] Remplacer les valeurs placeholder dans `config/contact.ts`
- [ ] Ajouter un vrai logo et une vraie image OG dans `public/`
- [ ] Configurer les variables SMTP
- [ ] Vérifier les textes et metadata avant mise en ligne
- [ ] Ajouter un framework de test si nécessaire

## Contribution

- Branche principale : `main`
- Adapter la stratégie de branches selon ton workflow
