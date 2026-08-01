import { integer, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { fixStatusEnum, riskClassEnum } from "./enums";
import { findings } from "./findings";
import { tenantPredicate } from "./rls";
import { appRole } from "./roles";
import { users } from "./users";

export const fixes = pgTable(
  "fixes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Denormalized off `findings.user_id` rather than walking the FK chain
    // — every tenant table carries `user_id` directly so no RLS policy has
    // to join (design decision, see docs/plans/02-db-schema-rls.md).
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    findingId: uuid("finding_id")
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
    status: fixStatusEnum("status").notNull().default("detected"),
    // Unknown until a fix diff actually exists (Phase 08) — the FSM starts
    // at "detected", before risk classification is possible.
    riskClass: riskClassEnum("risk_class"),
    chosenReplacement: text("chosen_replacement"),
    diff: text("diff"),
    reasoning: text("reasoning"),
    // Heuristic confidence headline (D3) — short label, not a raw score.
    confidence: text("confidence"),
    confidenceReasons: text("confidence_reasons").array(),
    prNumber: integer("pr_number"),
    prUrl: text("pr_url"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Set explicitly by transitionFix() on every write — this drizzle-orm
    // version has no column-level auto-update hook to rely on instead.
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("fixes_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
