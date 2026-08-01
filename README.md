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

## GitHub App & Auth setup (Phase 03)

Login (`/login`) and the GitHub App install flow (`/api/github/callback`,
`/api/github/webhooks`) both need real credentials — this section covers registering the two
separate GitHub-side identities Phase 03 uses and the env vars each needs. (Full local-setup guide,
covering the DB role/migration steps too, still lands in Phase 06 — this is scoped to just what's
new in this phase.)

**1. OAuth App (user login — separate from the GitHub App below):**

- GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
- Homepage URL: `http://localhost:3000`. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
- Set `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` from the generated client ID/secret.
- Generate `AUTH_SECRET` with `npx auth secret` (or `openssl rand -base64 32`). Set `AUTH_URL=http://localhost:3000`.

**2. GitHub App (repo install, PR authoring, webhooks — separate identity from the OAuth App):**

- GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.
- Homepage URL: anything (e.g. `http://localhost:3000`).
- Callback URL: `http://localhost:3000/api/github/callback`. Check "Request user authorization
  (OAuth) during installation" **off** — this App's callback is for install redirects, not login.
- Webhook URL: `http://localhost:3000/api/github/webhooks` (needs a public tunnel — e.g. `ngrok
  http 3000` — to actually receive events locally; GitHub can't reach `localhost` directly).
  Webhook secret: generate one and set it as `GITHUB_APP_WEBHOOK_SECRET`.
- Permissions: **Contents** — Read & write. **Pull requests** — Read & write. **Metadata** — Read-only.
- Subscribe to events: **Installation**, **Installation repositories**.
- After creating: note the App ID (`GITHUB_APP_ID`) and slug (`GITHUB_APP_SLUG`, from the App's
  URL). Generate a private key (Settings → General → Private keys) and set
  `GITHUB_APP_PRIVATE_KEY` to its full PEM contents (keep the `\n` line breaks — see
  `.env.example`'s format).

Once both are set, `pnpm dev`, sign in at `/login`, then use the "Install the GitHub App" link on
`/dashboard` to connect a test repo.
