import { pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantPredicate } from "./rls.js";
import { appRole } from "./roles.js";

/**
 * The tenant root. `users.id` is the single RLS scoping key for the whole
 * schema (`app.user_id`) — every other tenant table FKs to it directly, no
 * table walks a longer chain to reach it.
 *
 * Column shape (id/name/email/emailVerified/image) matches
 * `DefaultPostgresUsersTable` from `@auth/drizzle-adapter@1.11.3` exactly
 * (verified against the installed package, not assumed) so Phase 03 can
 * pass this table straight into `PostgresDrizzleAdapter(db, { usersTable:
 * users, ... })` with zero schema changes. `email_verified`'s JS property
 * name (`emailVerified`) is dictated by the adapter's internal lookups —
 * do not rename it.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("users_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.id),
      withCheck: tenantPredicate(table.id),
    }),
  ],
).enableRLS();
