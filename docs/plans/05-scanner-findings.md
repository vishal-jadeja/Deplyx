# Phase 05 — Scanner + Findings Pipeline

Status: not started    Updated: —

## Goal

Given a repo, fetch its tarball once, walk it locally, find literal deprecated-model-ID strings, extract real call-site context via tree-sitter (walk UP to the enclosing function — not a naive line window), and upsert findings. This is the core IP of the product.

## Depends on

03 (installation token minting), 04 (`model_deprecations` populated, worker DB patterns established).

## Tasks

- [ ] `packages/github`: `fetchTarball(installationId, owner, repo)` — streamed `GET /repos/{owner}/{repo}/tarball`, piped through `zlib.createGunzip()` → `tar-stream.extract()`, byte-counter aborts at `MAX_TARBALL_BYTES` (250MB, from `packages/shared` constants)
- [ ] `packages/scanner/grammars/` — download and commit prebuilt `.wasm` grammars for js/ts/py/go/rust/java (web-tree-sitter 0.26.11 compatible versions)
- [ ] `packages/scanner/src/parser-registry.ts` — lazy per-extension WASM loader, one `Parser` instance reused per language
- [ ] `packages/scanner/src/detectors/types.ts` — the plugin interface: `{ kind, buildIndex(deprecations), matchFile(file, index): LocatorHit[], extractContext(hit, tree): FixContext }`
- [ ] `packages/scanner/src/detectors/ai-model.ts` — implements the interface:
  - `buildIndex`: builds a `Set<string>` of all known `model_id`s from `model_deprecations`
  - `matchFile`: pass 1, cheap literal substring/`indexOf` sweep per file against the set — only files with ≥1 hit proceed
  - `extractContext`: pass 2, parse the hit file with tree-sitter, find the string-literal node containing the match, walk `.parent` up to the nearest function/method declaration (or whole file if under a size threshold), capture `[start_line, end_line]` + source text
- [ ] `packages/scanner/src/walk.ts` — file walker over the extracted tarball entries: skip `SKIP_DIRS`, skip files over `MAX_FILE_BYTES`, cap total at `MAX_FILES_SCANNED`, enforce `MAX_SCAN_DURATION` via an abort signal
- [ ] `apps/web/src/trigger/scan-repo.ts` — the Trigger task:
  1. rate-limit check in Redis (`MAX_SCANS_PER_REPO_PER_HOUR`)
  2. create `scans` row (status `running`)
  3. mint installation token, fetch+stream tarball
  4. run detector pipeline, collect locator hits + contexts
  5. upsert `findings` on the compound unique key (`repository_id, file_path, line, matched_value, kind`), compute severity via `computeSeverity()`
  6. soft-resolve: any previously-open finding for this repo not touched this scan gets `resolved_at = now()`
  7. update `scans` row (status `completed`/`failed`, `files_scanned`, timestamps)
- [ ] Manual "scan now" trigger path (route or script) for local testing ahead of the Phase 06 UI button
- [ ] Unit tests: parser-registry loads each grammar; ai-model detector correctly locates a literal `llama-3.3-70b-versatile` in a small fixture file and extracts the correct enclosing function; walk.ts respects all caps with synthetic oversized fixtures

## Acceptance

- Running `scan-repo` against a real test repo containing a hard-coded `llama-3.3-70b-versatile` string produces exactly one `findings` row at the correct `file_path`/`line`, with `context_code` containing the enclosing function (not just the matched line).
- Re-running the scan with no repo changes does not create duplicate rows (upsert confirmed).
- Removing the string and re-scanning sets `resolved_at` on the old finding.

## Deferred out

- Package-ecosystem detector (Phase 11) — interface exists, second implementation doesn't yet.
- Fix generation — findings only, no diffs yet.

## Decisions made

(append here during execution)

## Notes / blockers
