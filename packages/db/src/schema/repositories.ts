import { bigint, boolean, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { githubInstallations } from "./github-installations";
import { tenantPredicate } from "./rls";
import { appRole } from "./roles";
import { users } from "./users";

export const repositories = pgTable(
  "repositories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    installationId: uuid("installation_id")
      .notNull()
      .references(() => githubInstallations.id, { onDelete: "cascade" }),
    githubRepoId: bigint("github_repo_id", { mode: "number" }).notNull().unique(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    defaultBranch: text("default_branch").notNull(),
    private: boolean("private").notNull().default(false),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
    autoMergeEnabled: boolean("auto_merge_enabled").notNull().default(false),
    // Set when this repo is dropped from its installation — either the
    // whole App was uninstalled (`installation.deleted`, applied to every
    // repo under that installation) or just this repo was deselected
    // (`installation_repositories.removed`). Soft, same rationale as
    // `github_installations.removedAt`: scans/findings/fixes must survive a
    // later reinstall or re-add.
    removedAt: timestamp("removed_at", { withTimezone: true }),
  },
  (table) => [
    pgPolicy("repositories_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
