import { integer, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { scanStatusEnum } from "./enums.js";
import { repositories } from "./repositories.js";
import { tenantPredicate } from "./rls.js";
import { appRole } from "./roles.js";
import { users } from "./users.js";

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    status: scanStatusEnum("status").notNull().default("queued"),
    // Trigger.dev run id for this scan-repo task invocation (Phase 05).
    triggerRunId: text("trigger_run_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    filesScanned: integer("files_scanned"),
    error: text("error"),
  },
  (table) => [
    pgPolicy("scans_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
