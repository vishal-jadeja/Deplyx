# Phase 09 — Diff Review UI

Status: not started    Updated: —

## Goal

Show the generated fix as a reviewable in-app diff: the diff itself, the LLM's reasoning, the confidence panel, and an alternatives picker sourced from `model_deprecations.replacement_models[]` — never a silent auto-swap. Approving drives the fix status forward.

## Depends on

08 (real diffs + confidence to display).

## Tasks

- [ ] Diff viewer component — syntax-highlighted unified diff (reuse an existing React diff-view lib rather than hand-rolling)
- [ ] Confidence panel — heuristic headline (`HIGH/MEDIUM/LOW` + the `reasons[]` bullets) shown separately from the LLM's free-text `reasoning`, per D3
- [ ] Alternatives picker — dropdown/radio over `replacement_models[]`; changing the selection re-triggers `generate-fix` with the new target (does not mutate the existing `fixes` row in place — creates a fresh generation attempt so history isn't lost)
- [ ] Approve action — button calls `transitionFix(..., 'diff_generated', 'approved')`; disabled until a diff exists
- [ ] Reject/discard action — `transitionFix(..., 'diff_generated', 'closed')`
- [ ] Per-repo detail page (Phase 06) links each finding with a fix into this review view
- [ ] Loading/error states for in-flight generation and `fixes.status = failed`

## Acceptance

- A finding with a `diff_generated` fix shows diff + reasoning + confidence in one screen.
- Approving moves the fix to `approved` and is reflected immediately in the UI (no stale state).
- Picking a different alternative model produces a new fix attempt without destroying the previous one.

## Deferred out

- Actually opening the PR (Phase 10) — approve just flips status here.

## Decisions made

(append here during execution)

## Notes / blockers
