---
name: the-walk-devlog
description: Use this project skill when implementing a significant feature, important fix, notable refactor, cross-cutting technical or UX decision, or project tooling change in The-Walk, to decide whether and how to add a concise dated entry to docs/devlog/.
---

# The-Walk Devlog Protocol

This skill keeps a short, factual project memory in `docs/devlog/`. Use it at the end of a meaningful change to decide whether the devlog should be updated.

The devlog is not a changelog and not a task tracker. It records durable milestones that will help future takeover, project defense, or technical audit.

## When to Add an Entry

Add one entry when the work has real project value:

- new product or business feature;
- important UX improvement;
- cross-cutting system or tool setup;
- important permissions, security, data, or email/notification fix;
- notable architecture, data model, or service refactor;
- decision that will help future takeover or soutenance.

## When Not to Add an Entry

Do not add noise for:

- isolated typo fixes;
- formatting-only changes;
- dependency or metadata churn without project impact;
- tiny internal cleanup that does not change behavior or future maintenance;
- exploratory work that was not kept.

If unsure, prefer no entry unless the change would be useful to explain later during reprise or soutenance.

## Where to Write

- Devlog directory: `docs/devlog/`.
- Monthly file format: `docs/devlog/YYYY-MM.md`.
- Current project file on 2026-06-05: `docs/devlog/2026-06.md`.
- If the monthly file does not exist, create it with the same short header and format.
- If an entry is reconstructed after the fact, mark it explicitly with `(approx., entree retrospective)`.

## Entry Format

Use local project time when possible.

```md
## YYYY-MM-DD HH:MM

### Sujet

One short sentence.

### Changements

- Concrete change.
- Concrete change.

### Impact

Short practical impact for the project, users, maintainers, or soutenance.

### Vigilance

Known limitation, follow-up, or `Aucune vigilance particuliere.`
```

## Tone and Content

- Stay factual and concise.
- Say what was actually done, not what was intended.
- Do not turn the entry into marketing copy.
- Avoid long explanations and implementation dumps.
- Mention verification only if it matters to understand confidence.
- Keep entries readable months later by someone resuming the project.
- Do not invent exact dates, commit boundaries, metrics, or technical details that are not visible from the repo or supplied context.
- Prefer grouping related work into one useful milestone over writing many tiny entries.

## Suggested Prompt Usage

For future Codex sessions, explicitly ask:

> Utilise le skill projet `the-walk-devlog` si le changement merite une entree devlog.

The skill should not force a devlog entry for every commit. It only helps decide when a short trace is valuable.
