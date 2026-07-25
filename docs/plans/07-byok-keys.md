# Phase 07 — BYOK Provider Keys

Status: not started    Updated: —

## Goal

Let users securely store their own LLM API key for one or more of the 4 launch providers, so Phase 08's fix generation has something to call. Keys are encrypted at rest, never logged, never returned to the client after save.

## Depends on

06 (dashboard shell exists to hang the settings UI off of).

## Tasks

- [ ] `packages/shared/src/crypto.ts` — AES-256-GCM `encrypt(plaintext, masterKey)` / `decrypt(bytes, masterKey)`, 12-byte random IV, 16-byte auth tag, packed as `iv || tag || ciphertext` into one `Buffer`; `ENCRYPTION_MASTER_KEY` (32 raw bytes, base64) validated at boot via the Phase 01 zod env schema
- [ ] `provider_keys` table already exists from Phase 02 — confirm `encrypted_key bytea`, `key_version`, `last_four`, unique `(user_id, provider)`
- [ ] `packages/ai/src/providers/registry.ts` — 4-entry registry: `anthropic | openai | groq | google`, each mapping to its `@ai-sdk/*` package name and required key format hint
- [ ] Request-path service: `saveProviderKey(tenantDb, provider, rawKey)` — validates format, encrypts, upserts, returns only `{ provider, last_four, created_at }` (never the key)
- [ ] `providerKeysPublic` selector — the only exported read shape on the request path; excludes `encrypted_key` entirely at the type level
- [ ] Worker-only `decryptProviderKey(workerDb, userId, provider)` — lives in a module only importable from `apps/web/src/trigger/**` (lint-enforced), decrypts just-in-time
- [ ] Settings UI: "Connect your LLM provider" — provider dropdown, paste-key input (masked), save button, shows `last_four` + provider for already-connected keys, remove button
- [ ] Unit tests: encrypt→decrypt round-trip; tamper with ciphertext byte → decrypt throws (auth tag catches it); saved key never appears in any request-path `select()` result via a type-level check

## Acceptance

- Saving a key shows only `last_four` back in the UI/API response — grepping network responses confirms the raw key never leaves the encrypt call.
- DB row inspection shows `encrypted_key` as opaque bytes, not plaintext.
- Corrupting one byte of a stored `encrypted_key` and attempting decrypt throws (proves the auth tag is real, not decorative).

## Deferred out

- Actually calling the provider (Phase 08).
- Key rotation UI (the `key_version` column exists for this later; no rotation flow yet).

## Decisions made

(append here during execution)

## Notes / blockers
