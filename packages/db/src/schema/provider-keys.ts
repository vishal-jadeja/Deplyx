import {
  customType,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { llmProviderEnum } from "./enums.js";
import { tenantPredicate } from "./rls.js";
import { appRole } from "./roles.js";
import { users } from "./users.js";

/**
 * `bytea` has no built-in drizzle-orm pg-core column type — declared via
 * `customType`, mapping to/from a Node `Buffer` (postgres.js's native
 * representation for bytea). Holds `iv || tag || ciphertext` in one blob per
 * decision #11 (AES-256-GCM, 12-byte IV, 16-byte auth tag).
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/**
 * BYOK provider API keys (Phase 07 implements the crypto; this phase only
 * creates the columns). `encrypted_key` must never appear in a `select()`
 * on the request path — Phase 07's exported read helper omits it entirely.
 */
export const providerKeys = pgTable(
  "provider_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: llmProviderEnum("provider").notNull(),
    encryptedKey: bytea("encrypted_key").notNull(),
    keyVersion: integer("key_version").notNull().default(1),
    lastFour: text("last_four").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("provider_keys_user_provider").on(table.userId, table.provider),
    pgPolicy("provider_keys_tenant_isolation", {
      for: "all",
      to: appRole,
      using: tenantPredicate(table.userId),
      withCheck: tenantPredicate(table.userId),
    }),
  ],
).enableRLS();
