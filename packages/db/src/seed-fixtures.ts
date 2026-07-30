/**
 * The Phase 02 seed fixture — 2 users, 1 GitHub installation + repository +
 * finding each. Defined once here (pure data, no side effects) so
 * `scripts/seed.ts` and `test/rls.test.ts` share a single source of truth
 * instead of duplicating the seed emails/ids as magic strings in both
 * places.
 */
export const SEED_USERS = [
  {
    email: "alice@example.com",
    accountLogin: "alice-org",
    installationId: 990_001,
    githubRepoId: 880_001,
    repoName: "alice-repo",
    matchedValue: "llama-3.3-70b-versatile",
  },
  {
    email: "bob@example.com",
    accountLogin: "bob-org",
    installationId: 990_002,
    githubRepoId: 880_002,
    repoName: "bob-repo",
    matchedValue: "gpt-4-32k",
  },
] as const;
