# Phase 12 — Auto-Merge + Deploy Hardening

Status: not started    Updated: —

## Goal

Close out v1: opt-in risk-gated auto-merge, real Vercel + Trigger.dev deploy, and a security hardening pass appropriate for a public app with write access to strangers' repos.

## Depends on

11 (both detectors live; full fix pipeline exercised).

## Tasks

- [ ] Per-repo `auto_merge_enabled` toggle in repo settings UI (column already exists on `repositories` from Phase 02)
- [ ] Auto-merge eligibility check: `risk_class = 'low_risk_swap'` AND CI status on the PR is green (poll GitHub checks API or listen to `check_suite`/`status` webhooks) — `high_risk_rewrite` is **never** eligible regardless of CI, per PRD §9
- [ ] `apps/web/src/trigger/auto-merge.ts` — Trigger task triggered on CI-green webhook for an eligible PR, calls GitHub merge API, transitions fix to `merged`
- [ ] Webhook signature verification audit across all handlers (installation, PR, CI status) — confirm HMAC checks are present and constant-time compared, not just "looks right"
- [ ] Rate-limit budgets in Upstash: per-user scan requests, per-installation API budget awareness (respect GitHub's rate-limit headers, back off before hitting 5000/hr)
- [ ] Abuse controls review against PRD §12: confirm `MAX_TARBALL_BYTES`/`MAX_FILES_SCANNED`/`MAX_SCANS_PER_REPO_PER_HOUR` (D11) are enforced at every entry point, not just the happy path
- [ ] Secrets audit: `ENCRYPTION_MASTER_KEY`, GitHub App private key, webhook secret, DB URLs — confirm none appear in logs (grep Trigger.dev run logs for key material patterns)
- [ ] Vercel deploy: env vars configured, `apps/web` builds and deploys clean
- [ ] Trigger.dev deploy: tasks deployed to the cloud project, cron schedules active (`feed-poll` and, if wired, `repo-rescan`)
- [ ] `repo-rescan` cron actually scheduled now (deferred since Phase 04) — confirm it doesn't storm the same rate limits as manual scans
- [ ] Final README pass: full stranger-setup path re-verified end to end against the deployed instance
- [ ] Final CLAUDE.md pass: confirm nothing drifted from Phase 06's version during phases 07–11

## Acceptance

- A repo with `auto_merge_enabled` and a `low_risk_swap` fix merges automatically once its PR's CI goes green; an otherwise-identical `high_risk_rewrite` fix does **not**, even with green CI.
- Deployed instance on Vercel + Trigger.dev cloud is reachable and the full PRD §4 core user flow works against it with a fresh GitHub account.
- Security pass notes recorded in this file; no plaintext secrets found in logs.

## Deferred out

- Nothing — this is the last phase of the planned v1 scope. Anything found here that's out of scope gets recorded as a v2 candidate, not silently added.

## Decisions made

(append here during execution)

## Notes / blockers
