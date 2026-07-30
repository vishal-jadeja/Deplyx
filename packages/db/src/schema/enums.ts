import {
  FINDING_KINDS,
  FIX_STATUSES,
  LLM_PROVIDERS,
  RISK_CLASSES,
  SCAN_STATUSES,
  SEVERITIES,
} from "@deplyx/shared";
import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enums, built from the string-union tuples already defined in
 * packages/shared (the single source of truth for these literal sets — see
 * packages/shared/src/enums.ts and constants.ts). Keeping the dependency
 * arrow as db -> shared (not the reverse) means `shared` stays importable by
 * code that must not pull in @deplyx/db (e.g. future detector interfaces),
 * with no cycle.
 */
export const severityEnum = pgEnum("severity", SEVERITIES);
export const fixStatusEnum = pgEnum("fix_status", FIX_STATUSES);
export const riskClassEnum = pgEnum("risk_class", RISK_CLASSES);
export const findingKindEnum = pgEnum("finding_kind", FINDING_KINDS);
export const scanStatusEnum = pgEnum("scan_status", SCAN_STATUSES);
export const llmProviderEnum = pgEnum("llm_provider", LLM_PROVIDERS);
