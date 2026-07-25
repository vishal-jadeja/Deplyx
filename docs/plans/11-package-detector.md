# Phase 11 — Package Detector

Status: not started    Updated: —

## Goal

Ship the second, non-hero detector (PRD's "and it also does this") behind the same `Detector` plugin interface frozen in Phase 05, so the scan task needs zero changes. Deterministic first — the LLM path is only for genuinely API-breaking replacements (D4).

## Depends on

06 (scan pipeline stable; this phase ships after the hero reveal per PRD §3 staged-reveal recommendation — build can start earlier, but treat Phase 06 as the earliest sane dependency).

## Tasks

- [ ] `packages/scanner/src/detectors/package-ecosystem.ts` — implements the same `Detector` interface: `buildIndex` loads a deprecated/replacement package ruleset (JSON, hand-curated + versioned, one file per ecosystem), `matchFile` parses manifest files (`package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`) rather than source files, `extractContext` returns the manifest entry itself (no tree-sitter walk-up needed — manifests are declarative)
- [ ] Rule schema: `{ ecosystem, packageName, deprecatedVersionRange?, replacementPackage, replacementVersion, apiBreaking: boolean, notes }`
- [ ] Deterministic fix generator (no LLM): for `apiBreaking: false` rules, directly produce a 1:1 manifest diff (version/name bump), classify `low_risk_swap`, skip straight to `diff_generated` without calling `packages/ai`
- [ ] For `apiBreaking: true` rules, hand off to the existing Phase 08 `generate-fix` path with the manifest + a broader source-scan for the package's import usages as context, classify `high_risk_rewrite`
- [ ] Wire `package-ecosystem` as a second entry in the detector registry used by `scan-repo` — confirm zero changes needed to `apps/web/src/trigger/scan-repo.ts` itself (this is the interface's acceptance bar)
- [ ] Dashboard: findings list already generic on `kind` (Phase 06) — confirm package findings render correctly without UI changes beyond a kind icon/label
- [ ] Unit tests: manifest parsing per ecosystem against fixtures; deterministic fix generator produces a correct version-bump diff

## Acceptance

- A test repo with an outdated/deprecated npm package in `package.json` produces a `package` -kind finding and a `low_risk_swap` fix with zero LLM calls.
- `scan-repo` task code is unchanged from Phase 05/06 (diff shows only new files under `detectors/`, confirming the interface held).

## Deferred out

- Exhaustive rule coverage for all 5 ecosystems — ship a representative starter ruleset, not a complete database.

## Decisions made

(append here during execution)

## Notes / blockers
