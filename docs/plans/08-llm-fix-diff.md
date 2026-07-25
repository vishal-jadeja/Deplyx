# Phase 08 — LLM Fix Generation

Status: not started    Updated: —

## Goal

Turn a finding + its wide code context + a chosen replacement model into a real, validated diff, using the user's own BYOK key. Detection and fix-context stay separate (Phase 05 already built the context extraction) — this phase is purely "context in, diff out."

## Depends on

07 (decrypting a real provider key).

## Tasks

- [ ] `packages/ai/src/generate-fix.ts` — replaces the Phase-06 stub: Vercel AI SDK 7 `generateObject` call per provider, structured output schema: `{ diff: string, reasoning: string }`
- [ ] Prompt template: includes `context_code` (the enclosing-function block from Phase 05, not the single matched line), the matched model ID, the chosen replacement + its alternatives from `replacement_models[]`, and an explicit instruction to also fix param/SDK-shape mismatches (e.g. context-window-sensitive params), per PRD §7
- [ ] Diff parse/lint gate: parse the returned diff with a real diff parser (e.g. `parse-diff` or similar), reject/retry once if it doesn't parse; if still invalid, mark `fixes.status = failed` with the raw output in `error` for debugging
- [ ] Heuristic confidence scorer (`packages/shared/src/confidence.ts`) — pure function over `{ diffParses, lintClean, linesChanged, filesTouched, riskClass, replacementInFeed }` → `'high' | 'medium' | 'low'` + `reasons: string[]`
- [ ] `risk_class` classification: pure 1:1 string swap with nothing else changed → `low_risk_swap`; anything else → `high_risk_rewrite`
- [ ] `apps/web/src/trigger/generate-fix.ts` — Trigger task: load finding, decrypt key (worker-only per Phase 07), call `generate-fix`, run the lint gate, compute confidence + risk_class, write `fixes` row, `transitionFix(..., 'detected', 'diff_generated')`
- [ ] Wire the Phase 04 fan-out `TODO` hook to optionally enqueue `generate-fix` for affected findings when a user has opted in (or leave manual-trigger-only if no such opt-in exists yet — confirm against Phase 09's UI)
- [ ] Unit tests: confidence scorer against fixture combinations; risk_class classifier against a pure-string-swap diff vs. a diff that also touches a `max_tokens` param

## Acceptance

- Given a real finding + a real BYOK key (one of the 4 providers), `generate-fix` produces a diff that parses cleanly and a non-empty reasoning string.
- A synthetic 1:1 model-ID swap diff classifies as `low_risk_swap`; a diff touching an extra param/line classifies as `high_risk_rewrite`.
- Malformed/unparseable model output causes `fixes.status = failed` with the error preserved, not a silent crash.

## Deferred out

- The in-app diff review UI (Phase 09) — this phase only produces the data.
- PR creation (Phase 10).

## Decisions made

(append here during execution)

## Notes / blockers
