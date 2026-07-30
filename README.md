# Deplyx

GitHub-integrated dashboard that scans connected repos for deprecated/discontinued AI models
(and, later, deprecated packages), and generates reviewable fix PRs.

> **Status:** see [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for current phase and next action. This
> README is a stub — the full local-setup guide (env vars, GitHub App registration,
> application-role creation, migrations, Trigger.dev) lands in Phase 06
> (`docs/plans/06-dashboard-readonly.md`), once there's a working end-to-end path to document.

## Plan

See [`docs/plans/00-ROADMAP.md`](docs/plans/00-ROADMAP.md) for the full 12-phase build plan,
frozen architecture decisions, and status tracking.

## Repo layout

```
apps/web            Next.js app (dashboard, auth, GitHub App callback, webhooks) + Trigger.dev tasks
packages/db         Drizzle schema, RLS policies, migrations, typed clients
packages/github     Octokit wrapper: App auth, token minting, tarball fetch, PR creation
packages/scanner    tree-sitter parsers, literal matcher, call-site extraction
packages/ai         BYOK provider adapter + fix-generation interface
packages/shared     zod schemas, enums, shared constants, env validation
```

## Quickstart (Phase 01 scope only)

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate   # or: npm install -g pnpm@11.17.0
pnpm install
pnpm dev          # boots the placeholder Next.js app
pnpm lint
pnpm typecheck
pnpm test
```

No `.env` is required yet to boot the placeholder page — env validation
(`packages/shared/src/env.ts`) is wired but only enforced by code that actually needs a given
variable, which starts in Phase 02.
