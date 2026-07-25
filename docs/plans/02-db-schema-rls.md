# Phase 02 — DB Schema + RLS

Status: not started    Updated: —

## Goal

Full Drizzle schema for all 9 tables with RLS enforced at the database layer AND a type-safe scoping helper at the application layer, landing entirely in the initial migration. This phase is the trust boundary the whole product depends on — get it provably right before anything else touches the DB.

## Depends on

01 (tooling, env validation, `packages/shared` enums location).

## Tasks

- [ ] `packages/db` skeleton: `package.json`, exports map (`.` = app client + `withTenant`, `./worker` = worker client, separate entrypoints per decision #6)
- [ ] Enums in `packages/db/src/schema/enums.ts`: `severity`, `fix_status`, `risk_class`, `finding_kind`, `scan_status`, `llm_provider`
- [ ] Tables (`packages/db/src/schema/*.ts`), one file per table, per the data model in the design doc:
  - `users`, `github_installations`, `repositories`, `scans`, `findings` (with the compound UNIQUE), `fixes`, `model_deprecations` (global, no RLS), `provider_keys`
- [ ] `pgRole('deplyx_app').existing()` declared in schema
- [ ] `pgPolicy` (or `crudPolicy` from `drizzle-orm/neon`) per tenant table: `USING`/`WITH CHECK` on `user_id = current_setting('app.user_id')::uuid` (or the FK chain for tables without a direct `user_id`, e.g. `findings` may go through `repository_id`)
- [ ] `FORCE ROW LEVEL SECURITY` statement per tenant table (drizzle-kit may not emit this — hand-verify the generated SQL and patch the migration if needed)
- [ ] GRANT statements: `deplyx_app` gets `SELECT/INSERT/UPDATE/DELETE` on tenant tables, `SELECT` only on `model_deprecations`
- [ ] `drizzle-kit generate` → inspect migration 0000 by hand before applying — confirm policies + FORCE RLS + GRANTs are present
- [ ] `packages/db/scripts/create-app-role.ts` — idempotent (`DO $$ ... IF NOT EXISTS`), reads `APP_DB_PASSWORD` from env, creates `deplyx_app LOGIN NOBYPASSRLS`, run once against Neon before first migration
- [ ] App client: `postgres()` (postgres.js) against `APP_DATABASE_URL`, `prepare: false`
- [ ] Worker client (`packages/db/src/worker.ts`): `postgres()` against `WORKER_DATABASE_URL`, `prepare: false`, exported as `workerDb`
- [ ] `withTenant<T>(userId: string, fn: (db: TenantDb) => Promise<T>): Promise<T>` — opens a transaction, `SET LOCAL app.user_id = $1` via parameterized `set_config`, runs `fn`, commits. `TenantDb` is a branded type with no other constructor.
- [ ] Typed query helpers per tenant table that require a `TenantDb` param (compile error if a raw client is passed)
- [ ] `transitionFix(db, fixId, from, to)` — conditional `UPDATE fixes SET status = $to WHERE id = $fixId AND status = $from`, throws `FixTransitionError` on 0 rows affected
- [ ] `computeSeverity()` pure function in `packages/shared` per the D2 date-ladder + bump rule, unit-tested with a frozen clock
- [ ] Seed script: 2 users, 1 repo + 1 finding each
- [ ] `packages/db/test/rls.test.ts` — the RLS isolation test (3 cases: app-scoped-as-A sees only A, worker sees both, owner-role connection sees both and is asserted-failing-if-misconfigured)
- [ ] Wire `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:role` scripts

## Acceptance

- `pnpm db:role && pnpm db:migrate && pnpm db:seed` succeeds against the real Neon project.
- `pnpm test` runs `rls.test.ts` green: user A's query via `withTenant` returns 0 of user B's findings; worker client returns both; a raw owner-role connection returns both (proving the isolation is real RLS, not app-level filtering).
- Manually confirmed in `psql`: `\d+ findings` shows `rowsecurity | t` and `forcerowsecurity | t`.

## Deferred out

- Auth wiring (Phase 03) — `users.id` exists but nothing populates it yet outside the seed script.
- Any non-tenant business logic.

## Decisions made

(append here during execution)

## Notes / blockers
