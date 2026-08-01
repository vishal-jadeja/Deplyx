import type { Severity } from "./enums";

export interface ComputeSeverityInput {
  /** `findings`-adjacent: the deprecation's announced shutdown date, if any. */
  shutdownDate: Date | null;
  /** The deprecation feed's `replacement_models` array for this model. */
  replacementModels: readonly string[];
}

/** One step toward `critical`; `critical` has no further step (capped). */
const BUMP: Readonly<Record<Severity, Severity>> = {
  low: "medium",
  medium: "high",
  high: "critical",
  critical: "critical",
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function baseSeverityFromDate(shutdownDate: Date | null, now: Date): Severity {
  // No announced shutdown date yet — still a deprecated model, just no
  // ladder rung to place it on. Base case, not a fallback/error state.
  if (shutdownDate === null) return "medium";
  if (shutdownDate <= now) return "critical";
  if (shutdownDate <= addDays(now, 30)) return "high";
  if (shutdownDate <= addDays(now, 90)) return "medium";
  return "low";
}

/**
 * `findings.severity` per decision D2 (docs/plans/00-ROADMAP.md /
 * you-are-a-senior-sleepy-yeti.md): a date ladder against the deprecation's
 * `shutdown_date`, then a one-step bump (capped at `critical`) if the feed
 * has no replacement model listed yet — no migration path makes an
 * otherwise-medium-term deprecation more urgent, not less.
 *
 * This is `findings.severity` only — the *display* severity (bumped again
 * at read time if a linked fix is `risk_class = 'high_risk_rewrite'`) is a
 * separate, unstored, later concern; not computed here.
 *
 * Pure: same `input` and `now` always produce the same output. `now`
 * defaults to the real clock but can be pinned for deterministic tests
 * without mocking global time.
 */
export function computeSeverity(input: ComputeSeverityInput, now: Date = new Date()): Severity {
  const base = baseSeverityFromDate(input.shutdownDate, now);
  const hasReplacement = input.replacementModels.length > 0;
  return hasReplacement ? base : BUMP[base];
}
