import { integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

/**
 * Auth.js v5 adapter tables (Phase 03 — `@auth/drizzle-adapter@1.11.3`).
 * Column shapes match `DefaultPostgresAccountsTable` /
 * `DefaultPostgresSessionsTable` / `DefaultPostgresVerificationTokenTable`
 * exactly (verified against the installed package), so Phase 03 passes
 * these straight into `PostgresDrizzleAdapter(db, { accountsTable: accounts,
 * sessionsTable: sessions, verificationTokensTable: verificationTokens, ... })`
 * with zero schema changes. JS property names (userId, sessionToken,
 * providerAccountId, ...) are dictated by the adapter's internal column
 * lookups — do not rename them; DB column names are ours to choose.
 *
 * RLS is enabled + FORCED but carries **no policies and no grants to
 * `deplyx_app`** (see docs/plans/02-db-schema-rls.md, design decision #4).
 * These tables are Auth.js-internal, not user-facing data — the app role
 * cannot read or write them under any scoping, by design. Only a role with
 * BYPASSRLS (the owner/worker credential the Auth.js adapter connects
 * through in Phase 03) can touch them.
 */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
).enableRLS();

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}).enableRLS();

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
).enableRLS();
