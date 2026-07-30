/**
 * String-union source of truth for the Postgres enums `packages/db` defines
 * with drizzle's `pgEnum` (see `packages/db/src/schema/enums.ts`). Defined
 * here, not there, so code that must not depend on `@deplyx/db` (e.g. other
 * `packages/shared` modules, future detector interfaces) can reference the
 * same literal values without a circular dependency — `packages/db` imports
 * these tuples to build its `pgEnum`s, not the other way around.
 */
export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const FIX_STATUSES = [
  "detected",
  "diff_generated",
  "approved",
  "pr_open",
  "merged",
  "closed",
  "failed",
] as const;
export type FixStatus = (typeof FIX_STATUSES)[number];

export const RISK_CLASSES = ["low_risk_swap", "high_risk_rewrite"] as const;
export type RiskClass = (typeof RISK_CLASSES)[number];

export const FINDING_KINDS = ["ai_model", "package"] as const;
export type FindingKind = (typeof FINDING_KINDS)[number];

export const SCAN_STATUSES = ["queued", "running", "completed", "failed"] as const;
export type ScanStatus = (typeof SCAN_STATUSES)[number];
