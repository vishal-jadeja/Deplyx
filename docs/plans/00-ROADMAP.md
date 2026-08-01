# Deplyx — Roadmap

Source design/approval: `C:\Users\visha\.claude\plans\you-are-a-senior-sleepy-yeti.md` (approved 2026-07-25).

## Status

| # | Phase | Status | Updated |
|---|---|---|---|
| 01 | [Monorepo + tooling](01-monorepo-tooling.md) | done | 2026-07-25 |
| 02 | [DB schema + RLS](02-db-schema-rls.md) | done | 2026-07-30 |
| 03 | [Auth.js + GitHub App](03-auth-github-app.md) | code complete, live acceptance pending | 2026-08-01 |
| 04 | [Trigger.dev + feed-poll](04-trigger-feed-poll.md) | not started | — |
| 05 | [Scanner + findings](05-scanner-findings.md) | not started | — |
| 06 | [Read-only dashboard](06-dashboard-readonly.md) — **Milestone 1** | not started | — |
| 07 | [BYOK provider keys](07-byok-keys.md) | not started | — |
| 08 | [LLM fix generation](08-llm-fix-diff.md) | not started | — |
| 09 | [Diff review UI](09-diff-review-ui.md) | not started | — |
| 10 | [PR creation](10-pr-creation.md) | not started | — |
| 11 | [Package detector](11-package-detector.md) | not started | — |
| 12 | [Auto-merge + deploy hardening](12-automerge-deploy-harden.md) | not started | — |

## Frozen decisions (D1–D12)

See the design doc for full text. Summary:

- D1: `model_deprecations` mirrors the real `deprecations.info` feed 1:1 (array `replacement_models`, `content_hash`, etc.) — not the brief's singular field.
- D2: severity = date ladder (stored on `findings`) + no-replacement bump; risk-class bump is a derived display value, not stored (risk_class lives on `fixes`, which postdate findings).
- D3: confidence = heuristic headline (parses/lints/lines-changed/risk/replacement-in-feed) shown alongside separate LLM reasoning text.
- D4: package detector (Phase 11) is a deterministic rule engine first; escalates to LLM path only when a rule is `apiBreaking: true`.
- D5: latest-everything version policy (Next 16, React 19, Tailwind 4, Biome 2.5) — **except TypeScript, pinned to 5.9.3**. TS 7.0.2 was tried first per the original "latest everything" call; it dropped the classic `typescript/lib/typescript.js` compiler-API entrypoint (Go-native rewrite, CLI-only package shape), which broke Next.js's built-in type-check step outright (infinite reinstall loop) and would have broken drizzle-kit/vitest's tsconfck too. Confirmed via direct inspection of the installed package during Phase 01, not assumed. Revised to 5.9.3 by user decision — see Phase 01 notes.
- D6: Auth.js v5 beta (`next-auth@5.0.0-beta.32`), pinned exact.
- D7: plans live here, `docs/plans/`.
- D8: all infra accounts (Neon/Upstash/Trigger.dev/Vercel/GitHub App) already exist — phases consume env vars; README documents provisioning for other readers.
- D9: `web-tree-sitter` WASM grammars checked into `packages/scanner/grammars/`, no native node-gyp bindings.
- D10: BYOK launch providers — Anthropic, OpenAI, Groq, Google Gemini.
- D11: scan bounds — 250MB tarball / 25k files / 2MB per file / 10min task timeout / 4 scans-per-repo-per-hour (Redis).
- D12: plan covers all 12 phases through deployed v1.

## Non-obvious architecture calls (full list in design doc)

1. App DB role created by an idempotent script (`packages/db/scripts/create-app-role.ts`), not by drizzle-kit — migrations can't read secrets. Policies/GRANTs/FORCE RLS still all land in migration 0000.
2. `FORCE ROW LEVEL SECURITY` on every tenant table, not just `ENABLE`.
3. Tenant key = `users.id`. Single RLS session var: `app.user_id`.
4. `postgres` (postgres.js) driver for both app and worker clients, `prepare: false` (Neon pooler is transaction-mode).
5. RLS-scoped client is unconstructable outside `withTenant(userId, fn)` — no exported factory returns a raw scoped client.
6. Worker client lives at a separate entrypoint (`@deplyx/db/worker`), import-restricted by lint to `apps/web/src/trigger/**`.
7. Findings are soft-resolved (`resolved_at`), never deleted, on re-scan.
8. Tarball is streamed (`tar-stream` + `zlib.createGunzip()`), byte-counted, aborted at cap — never buffered whole.
9. Two-pass scan: cheap literal sweep first, tree-sitter parse only on files with a hit.
10. Detector plugin interface frozen now so the package detector (Phase 11) drops in without touching the scan task.
11. Provider keys: AES-256-GCM, per-record IV+tag in one `bytea`, `key_version` column from day one, never selected on the request path.
12. Fix status transitions go through one `transitionFix()` helper doing a conditional `UPDATE ... WHERE status = from`.
13. Feed-poll fan-out triggers on `content_hash` change or new `(provider, model_id)`, not every poll.
14. Redis feed cache: fast TTL key + no-TTL fallback key; feed-poll job degrades gracefully and still succeeds if upstream is down.
15. Installation tokens are **never stored** (brief overrides PRD §6) — minted on demand, held in memory only within one worker run.
16. Trigger.dev tasks live under `apps/web/src/trigger/**` but import only from `packages/*` — no Next.js runtime imports, lint-enforced.
17. **Biome** (not ESLint + Prettier) is the lint/format tool — user-directed change from the original scaffold draft. One `biome.json` at root; each workspace package runs `biome check .` scoped to itself, Biome resolves the root config by walking up. The two import-boundary rules from decisions #6/#16 are implemented via Biome's `noRestrictedImports` + `overrides[].includes` glob scoping, not ESLint's `no-restricted-imports` + flat-config `files`/`ignores`.

## Working agreement

- Small, conventional commits.
- End of each phase: tick that phase's checkboxes, append `## Decisions made`, flip its `Status:` line, update the table above, commit.
- `pnpm lint && pnpm typecheck && pnpm test` green before flipping a phase to done.
- Anything that contradicts a frozen decision gets raised in the phase file's Notes section, not silently absorbed.
