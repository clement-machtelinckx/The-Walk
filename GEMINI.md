# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project

The-Walk — Application métier privée pour la gestion de sessions de jeu de rôle (JDR).

## Commands

```bash
npm run dev      # Start dev server (Next.js 15+ + Turbopack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint (Next.js core web vitals + TypeScript)
```

## Architecture

**Stack:** Next.js 15+, React 19, TypeScript, TailwindCSS 4, shadcn/ui, Supabase (DB, Auth).

### Directory layout

- `app/` — Pages and API routes (App Router).
- `components/ui/` — shadcn/ui primitives.
- `components/layout/` — Shared layout building blocks (Header, Footer, Container, MenuBurger).
- `components/special/` — Business-specific components for JDR management.
- `config/site.ts` — Centralized application configuration.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Path alias

`@/*` maps to the project root.

## Conventions

- **Language:** French (copy, labels, comments if relevant).
- **Icons:** `lucide-react`.
- **Styling:** TailwindCSS 4 with CSS variables in `app/globals.css`.
- **UI First:** Use primitives from `components/ui/` (shadcn/ui) in priority.
- **Component Pattern:** Logic in `lib/`, shared UI in `components/ui/`, business logic UI in `components/special/` or `components/[feature]/`.
- **Conditional Classes:** Use `cn()` from `lib/utils`.

## UI & Contribution Rules

1. **Primitive First:** Before creating a new visual element, check if a `components/ui/` component exists (Card, Button, Badge, etc.).
2. **Business Extraction:** Extract business patterns into `components/special/` (e.g., `RoleBadge`, `EmptyState`) to avoid duplication.
3. **Tailwind Hygiene:** Avoid long lists of repeated utility classes in page components; use shared components instead.
4. **Mobile First:** Ensure all interfaces are usable on mobile devices first.

## Development Workflow

- This project was transformed from a showcase starter to a private business application.
- All showcase elements (contact forms, email templates, demo routes) have been removed.
- Future developments should focus on RPG session management, character tracking, and Supabase integration.
