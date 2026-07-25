# Phase 10 — PR Creation

Status: not started    Updated: —

## Goal

Turn an `approved` fix into a real PR on GitHub, authored by Deplyx, using an on-demand-minted installation token (never a stored one). Track the PR back to the fix via webhook.

## Depends on

09 (a fix reaches `approved`).

## Tasks

- [ ] `packages/github/src/pr.ts` — replaces the stub: given a fix's diff + target repo, mint an installation token, create a branch off default branch, apply the diff via the Git trees/blobs API (not a raw patch apply — build the tree properly), commit, open a PR (title/body includes finding context, model, replacement, confidence)
- [ ] `apps/web/src/trigger/open-pr.ts` — Trigger task: `transitionFix(..., 'approved', 'pr_open')`, call `pr.ts`, store `pr_number`/`pr_url` on the fix; on failure, `transitionFix(..., 'approved', 'failed')` with `error` populated (note: `approved -> failed` needs to be a legal transition in the FSM table — confirm/add in Phase 02's transition table if not already covered)
- [ ] Extend the Phase 03 webhook handler: `pull_request` events (`closed` with `merged: true` → `transitionFix(..., 'pr_open', 'merged')`; `closed` without merge → `transitionFix(..., 'pr_open', 'closed')`)
- [ ] UI: show PR link + live status on the finding detail once `pr_open`
- [ ] Unit/integration test against a real disposable test repo: full path from approved fix → real PR appears on GitHub with correct diff content

## Acceptance

- Approving a fix on a real test repo results in an actual PR on GitHub, authored by the Deplyx App identity, containing exactly the reviewed diff.
- Merging that PR on GitHub flips the local fix to `merged` via webhook without any polling.
- No installation token appears anywhere in logs or DB at any point in this flow.

## Deferred out

- Auto-merge (Phase 12) — this phase always requires a human to merge on GitHub.

## Decisions made

(append here during execution)

## Notes / blockers
