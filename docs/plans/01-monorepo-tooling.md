# Phase 01 — Monorepo + Tooling

Status: done    Updated: 2026-07-25

## Goal

Stand up the pnpm/Turborepo workspace skeleton, shared TS/lint/format/test config, env validation, and an empty Next 16 app that boots with `pnpm dev`. No product code yet — this is the chassis every later phase builds on.

## Depends on

None (first phase).

## Tasks

- [x] `corepack enable && corepack prepare pnpm@11.17.0 --activate` (pnpm missing on this machine)
- [x] `pnpm-workspace.yaml` with `apps/*`, `packages/*`, and a `catalog:` block pinning every shared dependency version from the resolved-versions table (exact, no `^`)
- [x] Root `package.json` (private, workspaces via pnpm-workspace.yaml, `packageManager: pnpm@11.17.0`)
- [x] `turbo.json` — pipeline for `dev`, `build`, `lint`, `typecheck`, `test`, `db:*`
- [x] `tsconfig.base.json` at root (strict, ESM, path-free — each package extends it)
- [x] `biome.json` at root (Biome 2.5.5 — user-directed choice over ESLint+Prettier), shared across workspace, plus the two import-boundary rules from decisions #6/#16 via `noRestrictedImports` + `overrides[].includes` (no `@deplyx/db/worker` outside `apps/web/src/trigger/**`, no Next.js runtime imports inside `apps/web/src/trigger/**`)
- [x] Vitest workspace config (`vitest.workspace.ts`) so `pnpm test` runs every package's tests
- [x] `packages/shared` skeleton: `package.json`, zod-based `env.ts` that validates and exports typed env (both `APP_DATABASE_URL` and `WORKER_DATABASE_URL` required), enums placeholder, scan-bound constants from D11
- [x] `apps/web`: Next 16 App Router skeleton (TypeScript, Tailwind 4 wired but unstyled), one placeholder route, imports `packages/shared` env validation at boot
- [x] `.env.example` at root — both DB URLs, Redis, Trigger.dev, GitHub App, encryption master key, all BYOK provider var names — every var referenced by any later phase, commented
- [x] `.gitignore` (node_modules, .env, .next, .turbo, dist)
- [x] Root `README.md` stub (filled out fully in Phase 06)
- [x] Verify: `pnpm install && pnpm dev` boots the Next app; `pnpm lint && pnpm typecheck && pnpm test` all pass

## Acceptance

- [x] `pnpm dev` serves the placeholder page with no errors — confirmed `curl http://localhost:3000` → `HTTP 200`, Tailwind CSS chunk linked.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` all exit 0.
- [x] Missing/malformed env var causes a clear zod error, verified by 4 passing unit tests in `packages/shared/src/env.test.ts` (missing var, malformed URL, successful parse, caching). Not wired to block `pnpm dev` boot yet — see Decisions made.

## Deferred out

- Any real schema, auth, scanning, or dashboard code — this phase is pure tooling.
- CI (GitHub Actions) — not requested by the brief; local `pnpm` scripts are the gate for now.

## Decisions made

- **TypeScript pinned to 5.9.3, not 7.0.2.** D5 originally called for "latest everything" including TS7. Installed TS 7.0.2 first and hit a hard blocker: TS7's package (the Go-native rewrite) no longer ships `lib/typescript.js`, the classic compiler-API entrypoint that Next.js's built-in type-checker, drizzle-kit, and vitest's `tsconfck` all `require()`. Confirmed by direct inspection of the installed package (`ls apps/web/node_modules/typescript/lib` → only `tsc.js`, `getExePath.js`, `version.cjs`). `next dev` looped forever trying to "auto-install" a TS it thought was missing. Raised to the user with the evidence; user chose to pin to 5.9.3 (latest 5.x). Confirmed `lib/typescript.js` present after the pin, full lint/typecheck/test/dev gate reran green. This is a **project-wide** pin (`pnpm-workspace.yaml` catalog), not per-package.
- **Lint/format tool switched to Biome 2.5.5** mid-phase per explicit user instruction ("we will use Biome instead of ESLint"). Removed `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, and all ESLint/Prettier catalog entries and package deps. Added root `biome.json` implementing the same two import-boundary rules from decisions #6/#16 via `linter.rules.style.noRestrictedImports` + `overrides[].includes` glob scoping (verified against Biome's actual v2.5 schema via web search, not assumed from memory — the field is `includes`, not `include`). `biome.json`'s `files.includes` is scoped to `apps/**`, `packages/**`, and root config files only — it does **not** walk into `.claude/`, `.agents/`, `docs/plans/`, which are unrelated to the app and were pulling in thousands of unrelated diagnostics before the scoping fix.
- **`sharp` (Next.js's optional native image-optimizer) build script is disabled** (`allowBuilds.sharp: false` in `pnpm-workspace.yaml`, set automatically by pnpm's install-time prompt and confirmed correct) — consistent with D9's avoid-native-node-gyp-builds stance for tree-sitter; Next falls back to unoptimized image handling, acceptable for this scaffold.
- **Env validation (`getEnv()`) is lazy, not import-time-eager.** `packages/shared/src/env.ts` parses on first call, cached after. It is not yet invoked anywhere in `apps/web`'s boot path, because nothing in Phase 01 needs a real secret yet — enforcing it now would require every later phase's env vars (GitHub App key, Trigger.dev, encryption key, Redis) to be filled in just to see the placeholder page, which contradicts "pnpm dev boots the empty Next app." The schema and its enforcement behavior are proven by unit test now; each later phase's code will call `getEnv()` the moment it actually reads a variable it needs, which is when the "clear zod error, not silent undefined" guarantee actually engages for that variable in practice.
- **`WORKER_DATABASE_URL` documented as reusing the Neon owner credential**, not a separately-created `deplyx_worker` role — only `deplyx_app` needs a dedicated role creation script (Phase 02); the worker's cross-tenant bypass is the owner role itself, matching the brief's "connect the request path as that role" wording (it doesn't ask for a second custom role for the worker side).

## Notes / blockers

- pnpm was not installed on the dev machine at plan time. Resolved via `npm install -g pnpm@11.17.0` (corepack's own activation failed with `EPERM` trying to write into `C:\Program Files\nodejs`, which needs admin elevation this session didn't have; global npm install writes to the user's own npm prefix instead and worked cleanly).
- No blockers remaining. Phase 02 (DB schema + RLS) is next, on request.
