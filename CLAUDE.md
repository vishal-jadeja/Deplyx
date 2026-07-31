# Deplyx — CLAUDE.md

Agent orientation doc. Kept current every phase alongside `PROJECT_STATUS.md`. For the *why* behind
any decision below, the full log lives in `docs/plans/00-ROADMAP.md` and each phase's own file
(`docs/plans/0N-*.md`, "Decisions made" section) — this file is the summary an agent needs before
touching code, not a replacement for those.

Source design/approval for the original 12-phase plan: `you-are-a-senior-sleepy-yeti.md` (approved
2026-07-25) — a local file on the user's machine, **not in this repo**. Treat `docs/plans/` as the
authoritative record; don't assume access to that source doc.

## What this is

GitHub-integrated dashboard that scans connected repos for deprecated/discontinued AI models (and,
later, deprecated packages), and generates reviewable fix PRs.

## Current status

Check `PROJECT_STATUS.md` first, every session — it's the one-glance answer to "where are we."
Phase 01 (tooling) and Phase 02 (DB schema + RLS) are done and live-verified against Neon. Phase 03
(Auth.js + GitHub App) is next, not started.

## Repo layout

```
apps/web            Next.js app (dashboard, auth, GitHub App callback, webhooks) + Trigger.dev tasks
packages/db          Drizzle schema, RLS policies, migrations, typed clients
packages/github      Octokit wrapper: App auth, token minting, tarball fetch, PR creation (Phase 03+)
packages/scanner     tree-sitter parsers, literal matcher, call-site extraction (Phase 05+)
packages/ai          BYOK provider adapter + fix-generation interface (Phase 07+)
packages/shared      zod schemas, enums, shared constants, env validation
docs/plans/          phase-by-phase specs, acceptance criteria, per-phase decision logs
```

Only `apps/web`, `packages/db`, and `packages/shared` exist as real code today; the rest land with
their respective phases.

## The trust boundary — read before touching `packages/db`

This is the one piece of architecture every later phase depends on. Get it wrong and tenant
isolation breaks.

- **Tenant key is `users.id`.** Every tenant table carries `user_id` directly (no FK-chain walks).
  RLS policy: `user_id = nullif(current_setting('app.user_id', true), '')::uuid` — fail-**closed**.
  An unscoped connection reads/writes zero rows, never a leak, never a 500.
- **`FORCE ROW LEVEL SECURITY`** on every tenant table, not just `ENABLE` — this also binds the
  table owner unless the owner role has `BYPASSRLS` (Neon's `neondb_owner` does, confirmed live).
- **Two clients, two purposes — never cross them:**
  - App/request path: `withTenant(userId, fn)` from `packages/db` — the *only* way to get a scoped
    query handle. Opens a transaction, `SET LOCAL app.user_id`, runs `fn`. Returns a branded
    `TenantDb` type nothing else can construct — you cannot accidentally get an unscoped client from
    this entrypoint.
  - Worker/cross-tenant path: `workerDb()` from `@deplyx/db/worker` — a **separate entrypoint**,
    import-restricted by Biome lint to `apps/web/src/trigger/**` only. If you're writing anything
    under `apps/web/src/trigger/`, this is what you import for DB access, not the default export.
  - Trigger.dev tasks import only from `packages/*` — no Next.js runtime imports (lint-enforced,
    mirrors the client restriction above).
- **`transitionFix(db, fixId, from, to)`** is the only writer for `fixes.status` — a conditional
  `UPDATE ... WHERE status = from`, throws on 0 rows affected. Don't hand-roll a status UPDATE
  elsewhere.
- **Findings are soft-resolved** (`resolved_at`), never deleted, on re-scan.
- **Auth.js adapter tables** (`accounts`, `sessions`, `verification_tokens`) have RLS
  enabled+forced but **no policies and no grants** to `deplyx_app` — only a BYPASSRLS connection
  (owner/worker) can touch them at all. Wire Auth.js's adapter through a client that has that.
- **Ordering matters at setup time:** `pnpm db:role` must run before `pnpm db:migrate` — the
  migration's `GRANT`/`CREATE POLICY` statements reference `deplyx_app`, which must already exist.

## Frozen decisions that affect how you write code

Full list (D1–D12 + 17 non-obvious architecture calls) in `docs/plans/00-ROADMAP.md`. The ones most
likely to bite an agent mid-task:

- **TypeScript pinned to 5.9.3**, not latest — TS7's Go-native rewrite drops the classic
  `typescript/lib/typescript.js` compiler-API entrypoint that Next.js/drizzle-kit/vitest need. Don't
  bump this without re-checking that entrypoint exists in whatever you're upgrading to.
- **Biome, not ESLint/Prettier.** One root `biome.json`; each package runs `biome check .` scoped to
  itself. The two import-boundary rules (worker-client / trigger-task restrictions above) are
  implemented via `noRestrictedImports` + `overrides[].includes` — Biome v2.5's field is `includes`,
  not `include`.
- **Every shared dependency is pinned exact in the root `catalog:` block** (`pnpm-workspace.yaml`),
  no `^`. Exception on record: `lenis` in `apps/web` (see `docs/plans/01-monorepo-tooling.md`,
  landing-page note) — pinned directly in-package, not yet reconciled with the catalog convention.
  Don't treat that one exception as license to skip the catalog for new deps; ask/flag instead.
- **Env validation (`getEnv()` in `packages/shared`) is lazy**, not import-time-eager. Code should
  call it the moment it actually needs a variable, not at module load — that's what gives a clear
  zod error instead of a silent `undefined` or an unrelated boot failure.
- **Installation tokens are never persisted** (GitHub App) — minted on demand, held in memory only
  within one worker run. If you're touching `packages/github` in Phase 03+, don't add a token
  column or cache.
- **Provider keys**: AES-256-GCM, per-record IV+tag in one `bytea`, `key_version` column exists now
  (Phase 02) but no crypto yet (Phase 07). Never select `encrypted_key` on the request path.

## Conventions

- Small, conventional commits.
- End of each phase: tick its checkboxes, append a `## Decisions made` entry in that phase's file,
  flip its `Status:` line, update the table in `PROJECT_STATUS.md` and `docs/plans/00-ROADMAP.md`,
  commit.
- `pnpm lint && pnpm typecheck && pnpm test` must be green before flipping a phase to done.
- Anything that contradicts a frozen decision (D1–D12 or the non-obvious-calls list) gets raised in
  the current phase file's Notes section, not silently absorbed — see the `lenis` catalog exception
  above for the pattern to follow.
- Don't create or delete the root `.env` file. It's gitignored and holds live credentials; an
  earlier session did this by accident and destroyed the user's real file. Edit it in place if a
  fix is needed, and say so explicitly rather than assuming it's missing/wrong.

## Commands

```bash
pnpm install
pnpm dev            # boots apps/web
pnpm lint            # biome check, workspace-wide
pnpm typecheck
pnpm test            # vitest workspace; packages/db's RLS suite is env-gated (skips without DATABASE_URL)
pnpm db:role         # idempotent — create/rotate the deplyx_app Postgres role (run before db:migrate)
pnpm db:migrate      # run against Neon's direct endpoint, not the pooler
pnpm db:seed
```

## Known gaps (see `PROJECT_STATUS.md` for the live list)

- Auth.js wiring not started (Phase 03) — adapter tables exist, nothing populates `users` outside
  the seed script yet.
- `provider_keys` encryption not implemented (Phase 07) — column exists, no crypto.
- Root `README.md` is intentionally a Phase 01-era stub until Phase 06 gives it something real to
  document end-to-end.
