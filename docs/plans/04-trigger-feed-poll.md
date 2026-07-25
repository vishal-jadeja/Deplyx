# Phase 04 — Trigger.dev + Feed-Poll Cron

Status: not started    Updated: —

## Goal

Wire Trigger.dev v4 end to end and implement the hero cross-tenant job: poll `deprecations.info`, cache aggressively in Redis, upsert `model_deprecations`, and fan out to every repo already known to use a newly-deprecated model. This is "Deplyx already knew" — the demo moment.

## Depends on

02 (worker DB client, `computeSeverity`).

## Tasks

- [ ] `apps/web/trigger.config.ts` — project ref, `apps/web/src/trigger` as the tasks dir, max duration defaults
- [ ] `pnpm trigger:dev` script wired
- [ ] `packages/shared/src/feed.ts` — zod schema for the real feed record shape (verified fields: `provider, model_id, announcement_date, deprecation_date, shutdown_date, replacement_models[], deprecation_context, url, content_hash, scraped_at, first_observed, last_observed`)
- [ ] Redis client (`@upstash/redis`) wrapper in `packages/shared`
- [ ] Feed fetch with two-tier cache (decision #14):
  - read `deplyx:feed:latest` (TTL 6h) — if hit, use it
  - else `fetch('https://deprecations.info/v1/deprecations.json')` — on success, write both `deplyx:feed:latest` (TTL 6h) and `deplyx:feed:last_good` (no TTL)
  - on fetch failure, fall back to `deplyx:feed:last_good`; if that's also empty, log degraded and return `[]` — **job still succeeds**
- [ ] `apps/web/src/trigger/feed-poll.ts` — `schedules.task`, cron e.g. daily:
  1. fetch feed (cached)
  2. for each record: upsert `model_deprecations` on `(provider, model_id)`, compare `content_hash` to detect new/changed
  3. for every changed/new record: query (via `workerDb`, cross-tenant by design) all `findings` with matching `model_id` across all repos
  4. recompute `computeSeverity()` for all affected findings, update in place
  5. record a fan-out log (repo ids notified) for observability — no fix generation yet, that's Phase 08's job triggered separately, or a placeholder `TODO` hook here
- [ ] `apps/web/src/trigger/repo-rescan.ts` — cron task **defined** (iterates all repos, would enqueue `scan-repo` per repo) but **not scheduled/wired** yet — scan-repo doesn't exist until Phase 05
- [ ] Manual trigger script/route to fire `feed-poll` on demand for testing
- [ ] Unit test: feed-poll logic with a mocked Upstash + mocked fetch, asserting the "upstream down → last_good → succeeds" path

## Acceptance

- Running `feed-poll` locally against the real `deprecations.info` populates `model_deprecations` with ~120+ rows.
- Killing network access to the feed (or pointing at a bad URL) still lets the job complete without throwing, using `last_good` (or empty on first-ever run).
- A seeded finding referencing a model whose `content_hash` changes gets its severity recomputed after a poll run.

## Deferred out

- `repo-rescan` scheduling (needs Phase 05's scan task to exist first).
- Actually calling `generate-fix` from the fan-out (Phase 08).

## Decisions made

(append here during execution)

## Notes / blockers
