# Phase 06 — Read-Only Dashboard (Milestone 1)

Status: not started    Updated: —

## Goal

Ship the read-only surface that proves the whole pipeline works: cross-repo severity dashboard, per-repo finding detail at file:line, manual scan trigger. **This phase closes the starter-prompt scaffold milestone** — both brief acceptance tests must pass here.

## Depends on

05 (findings exist to display).

## Tasks

- [ ] Tailwind 4 + shadcn/ui installed and themed in `apps/web`
- [ ] `apps/web/src/app/(dashboard)/repos/page.tsx` — cross-repo list: repo name, last scanned, severity counts (critical/high/medium/low) as badges, sourced via `withTenant`
- [ ] `apps/web/src/app/(dashboard)/repos/[id]/page.tsx` — per-repo detail: findings table (file, line, matched value, severity, model, replacement suggestion from `model_deprecations.replacement_models`), each row links to the GitHub file at that line
- [ ] "Scan now" button → enqueues `scan-repo` task, shows a pending/running state, polls or revalidates on completion
- [ ] Empty states: no repos connected yet → CTA to install the GitHub App
- [ ] `CLAUDE.md` at repo root: architecture overview, the 6 critical decisions from the starter brief, the two-client DB rule (which client is which, when each is allowed), package boundaries, conventions, what's stubbed
- [ ] `README.md`: local setup, env vars (both DB URLs explained), GitHub App registration steps, creating the application role, running migrations, starting Trigger.dev, running the app
- [ ] Run and record **Acceptance test 1** (manual, end-to-end): register/install App on a test repo with a hard-coded `llama-3.3-70b-versatile`, trigger scan, confirm dashboard shows the finding at correct file:line
- [ ] Run and confirm **Acceptance test 2** (automated, from Phase 02): RLS isolation test still green

## Acceptance

- A stranger following only the README can get from zero to a working dashboard.
- Acceptance test 1 passes and is recorded (screenshot or terminal transcript) in this file's Notes.
- Acceptance test 2 (`pnpm test`) is green.
- `pnpm lint && pnpm typecheck && pnpm test` all green — this is the milestone gate.

## Deferred out

- BYOK, fix generation, diff UI, PR creation, auto-merge, package detector — everything from Phase 07 onward. Stub interfaces only where the brief calls for it (`packages/ai`, PR creation function signatures) with typed TODOs.

## Decisions made

(append here during execution)

## Notes / blockers
