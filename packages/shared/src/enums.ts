/**
 * Placeholder string-union types mirroring the Postgres enums that Phase 02
 * (docs/plans/02-db-schema-rls.md) defines with drizzle's `pgEnum`. Kept here
 * so code written ahead of the schema (e.g. `packages/shared` constants,
 * future detector interfaces) can reference the same literal values without
 * importing `@deplyx/db` and creating a circular dependency.
 *
 * Phase 02 is the source of truth once it lands — these are re-exported
 * from there, not redefined.
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
