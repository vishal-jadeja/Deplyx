# Deplyx — Project Status

One-glance answer to "where are we at." Detailed phase-by-phase specs and decision logs live in
[`docs/plans/`](docs/plans/00-ROADMAP.md); this file is the fast summary, kept current at the end
of every phase.

**Last updated:** 2026-07-30

## Right now

**Phase 02 (DB schema + RLS) — ✅ done, verified against the live Neon project (2026-07-30).**

Role created (idempotency confirmed), migration 0000 applied, seed data in, and the RLS
isolation suite ran 4/4 green against real data — including the fail-closed negative check
(an unscoped `deplyx_app` connection sees 0 rows; auth tables are `permission denied`).
Next up: **Phase 03 — Auth.js + GitHub App**. One small piece of homework first, see
[**Next action**](#next-action).

## Phase status

| # | Phase | Status |
|---|---|---|
| 01 | Monorepo + tooling | ✅ done |
| 02 | DB schema + RLS | ✅ done |
| 03 | Auth.js + GitHub App | ⬜ not started |
| 04 | Trigger.dev + feed-poll | ⬜ not started |
| 05 | Scanner + findings | ⬜ not started |
| 06 | Read-only dashboard — **Milestone 1** | ⬜ not started |
| 07 | BYOK provider keys | ⬜ not started |
| 08 | LLM fix generation | ⬜ not started |
| 09 | Diff review UI | ⬜ not started |
| 10 | PR creation | ⬜ not started |
| 11 | Package detector | ⬜ not started |
| 12 | Auto-merge + deploy hardening | ⬜ not started |

Full detail, acceptance criteria, and per-phase decision logs: [`docs/plans/00-ROADMAP.md`](docs/plans/00-ROADMAP.md).

## Next action

Phase 02's live run used shell-derived connection strings, so **`.env` still needs two line
fixes** before the db scripts work straight from the file in future sessions:

1. `DATABASE_URL` — currently the *pooler* host; migrations want the direct endpoint. Remove
   `-pooler` from the hostname (e.g. `ep-xxx-pooler.c-4.us-east-2...` → `ep-xxx.c-4.us-east-2...`).
2. `APP_DATABASE_URL` — still has the literal `HOST` placeholder. Set it to
   `postgresql://deplyx_app:<your APP_DB_PASSWORD, URL-encoded>@<pooler host>/neondb?sslmode=require`
   (this one *keeps* `-pooler` — the request path is meant to use the pooled endpoint).

Then Phase 03 (Auth.js + GitHub App) can start any time.

## What exists today

- **Tooling** (Phase 01): pnpm/Turborepo workspace, Biome, Vitest, TypeScript 5.9.3 pinned,
  `packages/shared` with zod env validation.
- **`@deplyx/db`** (Phase 02): full Drizzle schema for all 8 product tables plus the
  3 Auth.js adapter tables; RLS policy + `FORCE ROW LEVEL SECURITY` on every tenant table, fail-closed
  (`current_setting('app.user_id', true)`, not fail-open); `withTenant()` — the only way to get a
  scoped query handle, a branded type nothing else can construct; `workerDb()` for the deliberately
  cross-tenant worker path; `transitionFix()` as the fix-status FSM's single conditional-UPDATE
  writer; an RLS isolation test suite proving the boundary is real Postgres RLS, not app-level
  filtering — **run 4/4 green against the live Neon project 2026-07-30**, migration applied, role
  created, seed data in place.
- **`computeSeverity()`** (`packages/shared`): the D2 date-ladder + no-replacement-bump severity
  scorer, pure and unit-tested with a frozen clock.
- **Public landing page** (`apps/web/src/app/page.tsx`, out-of-sequence — built ahead of Phase 06,
  logged in `docs/plans/01-monorepo-tooling.md`): marketing homepage at `/`, separate from the
  future `(dashboard)` route group. Adds `lenis` outside the catalog-pinning convention — noted,
  not yet reconciled.

## Known gaps / deliberately deferred

- `.env`'s two DB-URL lines need correcting (see Next action above) — this session ran with
  inline-derived values instead.
- Auth.js wiring (Phase 03) — the adapter tables exist with matching column shapes but nothing
  populates `users` outside the seed script yet.
- `provider_keys` encryption (Phase 07) — only the `bytea` column exists so far, no crypto.
- Root `README.md` is still a Phase 01-era stub; it gets fully written in Phase 06 once there's an
  end-to-end path to document (per the working agreement in `docs/plans/00-ROADMAP.md`).
