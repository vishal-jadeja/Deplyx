import { integer, pgPolicy, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { findingKindEnum, severityEnum } from "./enums.js";
import { repositories } from "./repositories.js";
import { tenantPredicate } from "./rls.js";
import { appRole } from "./roles.js";
import { scans } from "./scans.js";
import { users } from "./users.js";

export const findings = pgTable(
  "findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    // Nullable + ON DELETE SET NULL: findings outlive the scan that found
    // them (soft-resolve design, decision #7 — never deleted on re-scan).
    // If scan history is ever pruned, the finding must survive it.
    scanId: uuid("scan_id").references(() => scans.id, { onDelete: "set null" }),
    kind: findingKindEnum("kind").notNull(),
    filePath: text("file_path").notNull(),
    line: integer("line").notNull(),
    // TS property stays `column` for ergonomics; DB column is
    // `column_number` because `column` is a reserved Postgres keyword
    // (design decision #3).
    column: integer("column_number").notNull(),
    matchedValue: text("matched_value").notNull(),
    severity: severityEnum("severity").notNull(),
    enclosingSymbol: text("enclosing_symbol"),
    contextStartLine: integer("context_start_line"),
    contextEndLine: integer("context_end_line"),
    contextCode: text("context_code"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    unique("findings_unique_match").on(
      table.repositoryId,
      table.filePath,
      table.line,
      table.matchedValue,
      table.kind,
    ),
    pgPolicy("findings_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
