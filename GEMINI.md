# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- Language: French (copy, labels).
- Icons: `lucide-react`.
- Styling: TailwindCSS 4 with CSS variables in `app/globals.css`.
- Components use `cn()` from `lib/utils` for conditional class merging.

## Development Workflow

- This project was transformed from a showcase starter to a private business application.
- All showcase elements (contact forms, email templates, demo routes) have been removed.
- Future developments should focus on RPG session management, character tracking, and Supabase integration.
