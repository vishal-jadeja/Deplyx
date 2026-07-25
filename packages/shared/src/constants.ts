/**
 * Abuse-control / scan-cost bounds (decision D11 — see docs/plans/00-ROADMAP.md).
 * Enforced inside the scan-repo Trigger task (Phase 05), not merely documented.
 */
export const SCAN_BOUNDS = {
  /** Abort the tarball stream once this many bytes have been read. */
  MAX_TARBALL_BYTES: 250 * 1024 * 1024, // 250 MB
  /** Stop walking after this many files have been considered. */
  MAX_FILES_SCANNED: 25_000,
  /** Skip any single file larger than this. */
  MAX_FILE_BYTES: 2 * 1024 * 1024, // 2 MB
  /** Hard wall-clock budget for one scan-repo task run, in seconds. */
  MAX_SCAN_DURATION_SECONDS: 10 * 60, // 10 min
  /** Redis-enforced rate limit, per repository. */
  MAX_SCANS_PER_REPO_PER_HOUR: 4,
} as const;

/** Directories never worth walking into during a scan. */
export const SCAN_SKIP_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "vendor",
  "target",
  ".next",
  "__pycache__",
] as const;

/** File extensions the AI-model detector (Phase 05) considers. */
export const SCAN_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
] as const;

/** Feed cache keys/TTLs (decision #14 — two-tier Redis fallback). */
export const FEED_CACHE = {
  LATEST_KEY: "deplyx:feed:latest",
  LATEST_TTL_SECONDS: 6 * 60 * 60, // 6h
  LAST_GOOD_KEY: "deplyx:feed:last_good", // no TTL
} as const;

export const DEPRECATIONS_FEED_URL = "https://deprecations.info/v1/deprecations.json";

/** BYOK launch providers (decision D10). */
export const LLM_PROVIDERS = ["anthropic", "openai", "groq", "google"] as const;
export type LlmProvider = (typeof LLM_PROVIDERS)[number];
