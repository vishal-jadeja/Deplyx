import { bigint, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantPredicate } from "./rls.js";
import { appRole } from "./roles.js";
import { users } from "./users.js";

export const githubInstallations = pgTable(
  "github_installations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // GitHub's numeric IDs comfortably fit a JS-safe-integer bigint; a plain
    // `integer` (32-bit) would risk overflow as installation IDs grow.
    installationId: bigint("installation_id", { mode: "number" }).notNull().unique(),
    accountLogin: text("account_login").notNull(),
    accountType: text("account_type").notNull(),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("github_installations_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
