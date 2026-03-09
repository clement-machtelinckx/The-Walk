# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Site Skeleton — reusable starter for French-language showcase websites built with Next.js App Router.

This repository is intended to serve as a clean, clonable base for quickly launching new websites with a shared architecture, reusable components, generic forms, and email workflows.

## Commands

```bash
npm run dev      # Start dev server (Next.js 16 + Turbopack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint (Next.js core web vitals + TypeScript)
```

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, TailwindCSS 4, shadcn/ui (New York style), Zod, react-hook-form, Nodemailer.

### Directory layout

- `app/` — Pages and API routes (App Router). Each page can export metadata for SEO.
- `components/ui/` — shadcn/ui primitives (do not edit manually; use `npx shadcn@latest add <component>`).
- `components/layout/` — Shared layout building blocks such as Header, Footer, Container, MenuBurger, ParallaxBackground.
- `components/form/` — Form components with colocated Zod schemas (`*-schema.ts`).
- `components/special/` — Reusable or project-specific components kept as examples and optional building blocks.
- `config/site.ts` — Centralized site configuration (name, domain, SEO defaults, logo, OG image, contact info).
- `config/contact.ts` — Centralized contact entries and helpers `telHref()` / `mailHref()`.
- `lib/mailer.ts` — Nodemailer SMTP transporter (configured via env vars).
- `lib/email-templates/` — HTML email builders:
  - `shared.ts` — shared layout + helpers (`escapeHtml`, `kvTable`, etc.)
  - `contact.ts` — contact form email
  - `join.ts` — job application email
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Path alias

`@/*` maps to the project root (configured in `tsconfig.json` and `components.json`).

### Key patterns

- **Form flow:** form component uses react-hook-form + Zod resolver → POST to `/api/<endpoint>` → server validates with the same Zod schema (or equivalent server schema) → sends email via Nodemailer → returns JSON response.
- **Generic email routing:** contact form emails can be routed to different inboxes depending on request type.
- **Anti-bot:** forms include a honeypot `website` field.
- **File uploads:** join form accepts PDF/DOC/DOCX files (max 5MB), sent as email attachment.

### API routes

| Endpoint | Purpose |
|---|---|
| `POST /api/contact` | Contact form → email routed by request type |
| `POST /api/join` | Job application → email with CV attachment |

### Environment variables

Required for email:
- `SMTP_HOST`
- `SMTP_PORT` (default 587)
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

Optional:
- `MAIL_LOGO_URL`
- `MAIL_FOOTER_TEXT`

## Conventions

- Default copy, labels, and validation messages are in French.
- Icons use `lucide-react`.
- Design tokens are defined as CSS custom properties in `app/globals.css`.
- Components use `cn()` from `lib/utils` for conditional class merging.
- Prefer keeping the starter generic and configurable rather than tied to a specific business domain.

## Notes for refactoring

- Prefer **neutralizing** business-specific code over deleting it too early when it may be reused on future projects.
- Keep reusable mechanics (forms, mailer, upload handling, layout patterns) even if some pages do not use them immediately.
- Favor centralized configuration via `config/site.ts` and `config/contact.ts`.
- When adapting this starter to a new project:
  - update `config/site.ts`
  - update `config/contact.ts`
  - replace placeholder assets in `public/`
  - adjust metadata, navigation, and page content
  - remove unused pages only if they are clearly not needed
