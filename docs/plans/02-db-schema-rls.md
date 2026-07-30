# Phase 02 — DB Schema + RLS

Status: code complete, pending live-DB verification    Updated: 2026-07-30

## Goal

Full Drizzle schema for all 9 tables with RLS enforced at the database layer AND a type-safe scoping helper at the application layer, landing entirely in the initial migration. This phase is the trust boundary the whole product depends on — get it provably right before anything else touches the DB.

## Depends on

01 (tooling, env validation, `packages/shared` enums location).

## Tasks

- [x] `packages/db` skeleton: `package.json`, exports map (`.` = app client + `withTenant`, `./worker` = worker client, separate entrypoints per decision #6)
- [x] Enums in `packages/db/src/schema/enums.ts`: `severity`, `fix_status`, `risk_class`, `finding_kind`, `scan_status`, `llm_provider`
- [x] Tables (`packages/db/src/schema/*.ts`), one file per table, per the data model in the design doc:
  - `users`, `github_installations`, `repositories`, `scans`, `findings` (with the compound UNIQUE), `fixes`, `model_deprecations` (global, no RLS), `provider_keys` — plus `accounts`/`sessions`/`verification_tokens` (Auth.js adapter tables, pulled into this phase by user decision — see Decisions made)
- [x] `pgRole('deplyx_app').existing()` declared in schema
- [x] `pgPolicy` per tenant table: fail-closed `USING`/`WITH CHECK` on `user_id = nullif(current_setting('app.user_id', true), '')::uuid` (every tenant table carries `user_id` directly — no FK-chain walks)
- [x] `FORCE ROW LEVEL SECURITY` statement per tenant table — drizzle-kit did not emit it; hand-patched into the migration (10 tables: 7 tenant + 3 Auth.js adapter)
- [x] GRANT statements: `deplyx_app` gets `SELECT/INSERT/UPDATE/DELETE` on the 7 tenant tables, `SELECT` only on `model_deprecations`, nothing on the 3 Auth.js adapter tables
- [x] `drizzle-kit generate` → inspected migration 0000 by hand, hand-patched FORCE RLS + GRANTs, then re-ran `generate` to confirm zero drift ("No schema changes, nothing to migrate")
- [x] `packages/db/scripts/create-app-role.ts` — idempotent (`DO $$ ... IF NOT EXISTS`), reads `APP_DB_PASSWORD` from env, creates `deplyx_app LOGIN NOBYPASSRLS`
- [x] App client: `postgres()` (postgres.js) against `APP_DATABASE_URL`, `prepare: false`
- [x] Worker client (`packages/db/src/worker.ts`): `postgres()` against `WORKER_DATABASE_URL`, `prepare: false`, exported as `workerDb()`
- [x] `withTenant<T>(userId, fn)` — opens a transaction, `SET LOCAL app.user_id = $1` via parameterized `set_config`, runs `fn`, commits. `TenantDb` is a branded type derived structurally from drizzle's own transaction callback type, with no other constructor.
- [x] Typed query helpers per tenant table that require a `TenantDb` param (compile error if a raw client is passed) — `packages/db/src/queries/*.ts`
- [x] `transitionFix(db, fixId, from, to)` — conditional `UPDATE fixes SET status = $to WHERE id = $fixId AND status = $from`, throws `FixTransitionError` on 0 rows affected, validated against a legal-transition table first
- [x] `computeSeverity()` pure function in `packages/shared` per the D2 date-ladder + bump rule, unit-tested with a frozen clock (10 tests, both explicit-`now` and frozen-system-clock call styles)
- [x] Seed script: 2 users, 1 repo + 1 finding each (`packages/db/scripts/seed.ts`, fixture shared with the test via `src/seed-fixtures.ts`)
- [x] `packages/db/test/rls.test.ts` — the RLS isolation test (4 cases: app-scoped-as-A sees only A, worker sees both, owner-role connection sees both, app client identity assertion — see Decisions made)
- [x] Wire `pnpm db:generate`, `pnpm db:role`, `pnpm db:migrate`, `pnpm db:seed` scripts
- [ ] Run `pnpm db:role && pnpm db:migrate && pnpm db:seed` against the real Neon project (blocked on `.env` — see Notes/blockers)
- [ ] Manually confirm in the Neon SQL Editor: `relrowsecurity`/`relforcerowsecurity` both `t`, policies present, grants correct

## Acceptance

- `pnpm db:role && pnpm db:migrate && pnpm db:seed` succeeds against the real Neon project. **Not yet run — pending `.env`.**
- `pnpm test` runs `rls.test.ts` green: user A's query via `withTenant` returns 0 of user B's findings; worker client returns both; a raw owner-role connection returns both (proving the isolation is real RLS, not app-level filtering). **Code complete and passing its env-gated skip path (`4 skipped` on this machine, no `.env`); not yet run for real against live data.**
- Manually confirmed in `psql`: `\d+ findings` shows `rowsecurity | t` and `forcerowsecurity | t`. **Pending — no local `psql`; will use the Neon SQL Editor instead (see verification queries in the plan file).**

Everything else — `pnpm lint && pnpm typecheck && pnpm test` across the whole repo (this phase's own code, not pre-existing unrelated `apps/web` changes) — is green today.

## Deferred out

- Auth wiring (Phase 03) — `users.id` exists but nothing populates it yet outside the seed script. The Auth.js adapter tables (`accounts`/`sessions`/`verification_tokens`) exist with matching column shapes (verified against `@auth/drizzle-adapter@1.11.3`'s actual type contract) but zero grants — Phase 03 must connect the adapter through a BYPASSRLS-capable client.
- Any non-tenant business logic.
- `provider_keys` encryption itself (Phase 07) — this phase only creates the `bytea` + `key_version` columns.

## Decisions made

- **`neondb_owner` has `rolbypassrls = true`**, confirmed via the Neon SQL Editor before writing the plan (`select rolname, rolbypassrls, rolsuper from pg_roles`). This resolved the one real open risk in the brief: `FORCE ROW LEVEL SECURITY` subjects the *table owner* to policies, and `BYPASSRLS` is a role attribute that Postgres never inherits through role membership — had the owner lacked it, `workerDb`, `db:seed`, and the RLS test's case 3 would all have broken under FORCE. Because it has the attribute directly, the original design (FORCE everywhere, worker reuses the owner credential, only `deplyx_app` needs creating) stands unmodified.
- **Auth.js adapter tables (`accounts`, `sessions`, `verification_tokens`) land in this migration**, not Phase 03 (user decision) — resolves the "9 tables" vs. 8-in-the-data-model discrepancy in the original phase doc. Their column shapes were built to match `@auth/drizzle-adapter@1.11.3`'s actual `DefaultPostgres*Table` type contract exactly (verified by extracting and reading the installed package, not assumed), so Phase 03 can pass them straight into `PostgresDrizzleAdapter(db, { usersTable: users, accountsTable: accounts, ... })` with zero schema changes. They get RLS enabled + forced but **no policies and no grants** to `deplyx_app` — only a BYPASSRLS connection (owner/worker) can touch them, doubly enforced (RLS denies, and the GRANT layer denies even the attempt).
- **`rls.test.ts` is env-gated** (user decision): `describe.skipIf(!process.env.DATABASE_URL)`, so a clean checkout without credentials still passes `pnpm test` — confirmed empirically (the test file imports cleanly and skips, rather than throwing, with no `.env` present). Wherever `DATABASE_URL` is set, it runs for real.
- **Policy predicate is fail-closed, not fail-open**: `user_id = nullif(current_setting('app.user_id', true), '')::uuid`. The `true` (missing_ok) argument makes an unset session variable return `NULL` instead of raising; `nullif` turns an empty string into `NULL` too; `NULL = anything` is `NULL`, which both `USING` and `WITH CHECK` treat as "does not satisfy." An unscoped `deplyx_app` connection therefore reads and writes exactly zero rows, never a 500 and never everyone's data.
- **`pgEnum`s are built from `packages/shared`'s existing const tuples** (`SEVERITIES`, `FIX_STATUSES`, etc.) rather than redeclaring the literals — keeps the dependency arrow `db → shared`, not the reverse (Phase 01 originally wrote the comment the other way around; corrected).
- **`findings.column` → DB column `column_number`** (`column` is a reserved Postgres keyword); the TS property stays `column`.
- **Every tenant table carries `user_id` directly**, including `findings` and `fixes` — no policy walks an FK chain to reach it.
- **Migrations run against Neon's direct endpoint, the app/worker clients against the pooled one** — DDL over a transaction-mode pooler is a known source of odd failures; documented in `drizzle.config.ts` and `.env.example`.
- **`TenantDb` is derived structurally**, not hand-typed: `Parameters<Parameters<AppDb["transaction"]>[0]>[0]`, branded with a unique symbol. This tracks whatever drizzle-orm's own `postgres-js` transaction wrapper actually produces, rather than a manually-maintained type that could drift from the real one.
- **`workerDb` is a function (`workerDb()`), not a plain exported instance** — construction (and the `getEnv()` read behind it) is deferred past module-import time. This matters concretely: `rls.test.ts` imports it even when `describe.skipIf` will skip every test, and an eagerly-constructed client would throw on import alone when no `.env` is present, defeating the skip.
- **`tsx@4.23.1` added to the catalog** to run `packages/db`'s `.ts` scripts (`db:role`/`db:migrate`/`db:seed`), matching Phase 01's precedent of adding tooling on demand. Its `esbuild` transitive dependency's postinstall (prebuilt-binary fetch only) is allowed in `pnpm-workspace.yaml`, same category as the existing `sharp` exception.
- **`packages/db/drizzle/` is excluded from Biome's scope** — it's drizzle-kit-owned generated output; fighting its formatting on every `db:generate` would be pointless.

## Notes / blockers

- **Blocked on `.env`**: the user opted to create `.env` themselves ("I'll create .env now") rather than have it generated. Everything that doesn't require a live database is done, verified, and committed — schema, migration (hand-patched and regenerated with zero drift), role script, clients, `withTenant`, query helpers, `transitionFix`, `computeSeverity`, seed script, and the RLS test suite (currently passing its skip path). Once `.env` has real Neon credentials, running `pnpm db:role && pnpm db:migrate && pnpm db:seed && pnpm test` is the remaining step to flip this phase to `done`.
- **Hard ordering requirement**: `pnpm db:role` MUST run before `pnpm db:migrate`. The migration's `CREATE POLICY ... TO deplyx_app` and `GRANT ... TO deplyx_app` statements reference a role that must already exist — Postgres will fail the migration with "role deplyx_app does not exist" otherwise. This matches the acceptance criteria's `db:role && db:migrate && db:seed` ordering; called out explicitly here since it's a hard failure, not a soft preference.
- Self-review pass (this session): read through every file in the diff again looking specifically for logic bugs, not just compiler errors. Findings: none in this phase's own code. Two things worth recording as verified-not-bugs:
  - `provider_keys.encrypted_key`'s generated SQL type is the quoted identifier `"bytea"` rather than bare `bytea` (drizzle's `customType()` output) — confirmed this resolves to the identical built-in type (Postgres folds unquoted identifiers to lowercase before lookup; `"bytea"` is already lowercase, so it matches `pg_type.typname` either way). Cosmetically unusual, functionally identical.
  - postgres.js has built-in `bytea ↔ Buffer` serialization (hex-encoded wire format) — confirmed by reading its `types.js` — so `provider_keys.encryptedKey`'s `customType<{ data: Buffer }>` round-trips correctly with no extra type registration needed, ready for Phase 07.
- Regenerating the migration a second time against the finished schema produced `No schema changes, nothing to migrate` — confirms the hand-patched migration and the schema are in sync and won't drift on the next `db:generate`.
- `apps/web/src/app/layout.tsx` and `apps/web/next-env.d.ts` show as modified in `git status` but predate this session and were never touched by this phase's work (confirmed via `git diff` — the layout change is an unrelated `suppressHydrationWarning` edit). Left alone; not this phase's concern.
