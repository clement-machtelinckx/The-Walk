# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ProtecAudio — insurance and protection solutions website for audioprothesists (hearing aid professionals). French-language, public-facing site built with Next.js App Router.

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

- `app/` — Pages and API routes (App Router). Each page exports metadata for SEO.
- `components/ui/` — shadcn/ui primitives (do not edit manually; use `npx shadcn@latest add <component>`).
- `components/layout/` — Header, Footer, Container, ParallaxBackground.
- `components/form/` — Form components with colocated Zod schemas (`*-schema.ts`).
- `components/special/` — Business-specific components (GarantieCard, ProtectionPill, etc.).
- `config/contact.ts` — Centralized contact info for all cabinets (Eurossur, Mark'assur, Rossard) with helper functions `telHref()` and `mailHref()`.
- `lib/mailer.ts` — Nodemailer SMTP transporter (configured via env vars).
- `lib/email-templates/` — HTML email builders: `shared.ts` (layout + utilities like `escapeHtml`, `kvTable`), `contact.ts`, `join.ts`.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Path alias

`@/*` maps to the project root (configured in tsconfig.json and components.json).

### Key patterns

- **Form flow:** Form component uses react-hook-form + Zod resolver → POST to `/api/<endpoint>` → server validates with same Zod schema → sends email via Nodemailer → returns JSON response.
- **Email routing:** Contact form emails route to different addresses based on insurance type (see `app/api/contact/route.ts`).
- **Anti-bot:** Both forms include a honeypot `website` field.
- **File uploads:** Join form accepts PDF/DOC/DOCX (max 5MB), sent as email attachment.

### API routes

| Endpoint | Purpose |
|---|---|
| `POST /api/contact` | Contact form → email routed by insurance type |
| `POST /api/join` | Job application → email with CV attachment |

### Environment variables (required for email)

`SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`. Optional: `MAIL_LOGO_URL`, `MAIL_FOOTER_TEXT`.

## Conventions

- All content is in French — keep copy, labels, and validation messages in French.
- Icons use `lucide-react` (migrated from MDI).
- Design tokens defined as CSS custom properties in `app/globals.css` (primary: #4f85c3).
- Components use `cn()` from `lib/utils` for conditional class merging.
