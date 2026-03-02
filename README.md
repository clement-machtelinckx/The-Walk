# ProtecAudio

Site vitrine de **ProtecAudio** — solutions d'assurance et de protection pour audioprothésistes.
Contenu intégralement en **français**. Domaine cible : `protecaudio.fr`.

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
cp .env.example .env.local   # voir section Variables d'environnement
npm run dev                   # http://localhost:3000
```

### Scripts disponibles

| Commande        | Description                |
|-----------------|----------------------------|
| `npm run dev`   | Serveur de dev (Turbopack) |
| `npm run build` | Build de production        |
| `npm start`     | Serveur de production      |
| `npm run lint`  | ESLint                     |

> Il n'y a pas de framework de test configuré pour l'instant.

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# SMTP (requis pour l'envoi d'emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=motdepasse

# Expéditeur des emails (requis)
MAIL_FROM="ProtecAudio <noreply@protecaudio.fr>"

# Optionnel
MAIL_LOGO_URL=https://protecaudio.fr/logo-transparent.png
MAIL_FOOTER_TEXT=ProtecAudio — Tous droits réservés.
```

Les routes API (`/api/contact`, `/api/join`) lèvent une erreur explicite si les variables SMTP ou `MAIL_FROM` sont
absentes.

## Structure du projet

```
app/
├── page.tsx                  # Page d'accueil
├── layout.tsx                # Layout racine (Header, Footer, Parallax)
├── globals.css               # Tokens CSS (primary: #4f85c3)
├── contact/                  # Page contact
│   └── form/                 # Page formulaire contact
├── garantie/                 # Garanties audioprothèses
├── protection/               # Solutions audioprothésistes
├── join/                     # Page "Nous rejoindre"
├── appeler-agence/           # Page appel agence
├── mentions-legales/         # Mentions légales
├── api/
│   ├── contact/route.ts      # POST — formulaire contact → email routé par type d'assurance
│   └── join/route.ts         # POST — candidature avec CV en pièce jointe
├── robots.ts                 # robots.txt dynamique
└── sitemap.ts                # sitemap.xml dynamique

components/
├── ui/                       # Primitives shadcn/ui (ne pas modifier à la main)
├── layout/                   # Header, Footer, Container, ParallaxBackground, MenuBurger
├── form/
│   ├── contact/              # Formulaire contact + schéma Zod
│   └── join/                 # Formulaire candidature + schéma Zod
└── special/                  # Composants métier (GarantieCard, ProtectionPill, ContactCard…)

config/
└── contact.ts                # Coordonnées centralisées des cabinets + helpers telHref/mailHref

lib/
├── mailer.ts                 # Transport Nodemailer (SMTP)
├── utils.ts                  # cn() — clsx + tailwind-merge
└── email-templates/
    ├── shared.ts             # Layout email HTML + utilitaires (escapeHtml, kvTable)
    ├── contact.ts            # Template email contact
    └── join.ts               # Template email candidature
```

## Patterns clés

### Formulaires

Form component (`react-hook-form` + Zod resolver) → `POST /api/<endpoint>` → le serveur re-valide avec le même schéma
Zod → envoi email via Nodemailer → réponse JSON.

### Routage email

Le formulaire de contact route vers des adresses différentes selon le type d'assurance choisi (voir `INSURANCE_EMAIL`
dans `app/api/contact/route.ts`).

### Anti-bot

Les deux formulaires incluent un champ honeypot `website` (caché en CSS).

### Upload fichier

Le formulaire candidature accepte PDF/DOC/DOCX (max 5 Mo), envoyé en pièce jointe de l'email.

### Composants shadcn/ui

Les fichiers dans `components/ui/` sont générés. Pour ajouter un composant :

```bash
npx shadcn@latest add <component>
```

### Alias de chemin

`@/*` pointe vers la racine du projet (tsconfig.json + components.json).

## TODO avant mise en production

### Données de contact placeholder

Les valeurs suivantes dans `config/contact.ts` sont des **placeholders** à remplacer :

- [ ] **Rossard** — téléphone `02 00 00 00 00` (ligne 56) → remplacer par le vrai numéro
- [ ] **Recrutement** — email `recrutement@protec.test` (ligne 61) → remplacer par une vraie adresse (le TLD `.test` est
  réservé et ne fonctionne pas)
- [ ] Supprimer l'entrée `placeholder` du type `ContactKey` et de `CONTACTS` une fois les vrais contacts en place

### Configuration

- [ ] Configurer les variables d'environnement SMTP sur le serveur de production
- [ ] Définir `MAIL_FROM` avec l'adresse d'expédition officielle
- [ ] Vérifier le domaine `protecaudio.fr` (SPF, DKIM, DMARC) pour la délivrabilité des emails

### Fonctionnel

- [ ] Ajouter un framework de test (Vitest ou Playwright)

## Contribution

- Branche principale : `main`
- Branche de développement : `dev`
- PR de `dev` → `main` pour les mises en production
