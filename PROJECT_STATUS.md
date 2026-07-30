# Deplyx — Project Status

One-glance answer to "where are we at." Detailed phase-by-phase specs and decision logs live in
[`docs/plans/`](docs/plans/00-ROADMAP.md); this file is the fast summary, kept current at the end
of every phase.

**Last updated:** 2026-07-30

## Right now

**Phase 02 (DB schema + RLS) — code complete, blocked on one manual step.**

Everything that doesn't require a live database is done, tested, and committed. What's left is
mechanical: put real Neon credentials in `.env`, then run four commands. See
[**Next action**](#next-action) below.

## Phase status

| # | Phase | Status |
|---|---|---|
| 01 | Monorepo + tooling | ✅ done |
| 02 | DB schema + RLS | 🟡 code complete, pending live-DB run |
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

To finish Phase 02 and unblock Phase 03:

1. Fill in `.env` at the repo root (copy from `.env.example`) with real values for:
   `DATABASE_URL` (Neon owner, direct endpoint), `APP_DATABASE_URL` (pooled endpoint, filled in
   *after* step 2 creates the role), `WORKER_DATABASE_URL` (same as `DATABASE_URL`), and
   `APP_DB_PASSWORD` (a password you choose for the new role).
2. Run, in this exact order (the migration references a role that must already exist):
   ```bash
   pnpm db:role       # creates deplyx_app
   pnpm db:migrate    # applies migration 0000 — schema, RLS policies, FORCE RLS, grants
   pnpm db:seed       # 2 users, 1 repo + finding each
   pnpm test          # rls.test.ts now runs for real instead of skipping
   ```
3. In the Neon SQL Editor, spot-check: `relrowsecurity`/`relforcerowsecurity` are both `t` on every
   tenant table; `pg_policies` shows one policy per tenant table; `model_deprecations`'s grant is
   `SELECT`-only.
4. Flip Phase 02's `Status:` line to `done` in `docs/plans/02-db-schema-rls.md` and this file's
   table above.

Nothing else is blocking — the moment `pnpm test` is green against live data, Phase 03 can start.

## What exists today

- **Tooling** (Phase 01): pnpm/Turborepo workspace, Biome, Vitest, TypeScript 5.9.3 pinned,
  `packages/shared` with zod env validation.
- **`@deplyx/db`** (Phase 02, this session): full Drizzle schema for all 8 product tables plus the
  3 Auth.js adapter tables; RLS policy + `FORCE ROW LEVEL SECURITY` on every tenant table, fail-closed
  (`current_setting('app.user_id', true)`, not fail-open); `withTenant()` — the only way to get a
  scoped query handle, a branded type nothing else can construct; `workerDb()` for the deliberately
  cross-tenant worker path; `transitionFix()` as the fix-status FSM's single conditional-UPDATE
  writer; an RLS isolation test suite proving the boundary is real Postgres RLS, not app-level
  filtering.
- **`computeSeverity()`** (`packages/shared`): the D2 date-ladder + no-replacement-bump severity
  scorer, pure and unit-tested with a frozen clock.

## Known gaps / deliberately deferred

- No live-database verification yet for Phase 02 (see Next action above).
- Auth.js wiring (Phase 03) — the adapter tables exist with matching column shapes but nothing
  populates `users` outside the seed script yet.
- `provider_keys` encryption (Phase 07) — only the `bytea` column exists so far, no crypto.
- Root `README.md` is still a Phase 01-era stub; it gets fully written in Phase 06 once there's an
  end-to-end path to document (per the working agreement in `docs/plans/00-ROADMAP.md`).
