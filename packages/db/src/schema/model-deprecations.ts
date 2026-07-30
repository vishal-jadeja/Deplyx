import { date, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

/**
 * Global table, mirroring https://deprecations.info/v1/deprecations.json 1:1
 * (decision D1) — NOT per-tenant, so it carries no RLS at all (no `enableRLS`,
 * no policy). `deplyx_app` gets SELECT only (granted in the migration, not
 * here — grants aren't a schema-level construct); nothing needs INSERT/
 * UPDATE/DELETE except the feed-poll worker (Phase 04), which writes via
 * `workerDb`.
 *
 * `provider` here is the feed's free-text provider field (the real feed
 * spans far more providers than Deplyx's 4 BYOK launch providers, D10) —
 * deliberately `text`, not `llm_provider` enum. Do not conflate the two.
 */
export const modelDeprecations = pgTable(
  "model_deprecations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    modelId: text("model_id").notNull(),
    announcementDate: date("announcement_date", { mode: "date" }),
    deprecationDate: date("deprecation_date", { mode: "date" }),
    shutdownDate: date("shutdown_date", { mode: "date" }),
    replacementModels: text("replacement_models").array().notNull().default([]),
    deprecationContext: text("deprecation_context"),
    url: text("url"),
    contentHash: text("content_hash").notNull(),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }),
    firstObserved: timestamp("first_observed", { withTimezone: true }).notNull().defaultNow(),
    lastObserved: timestamp("last_observed", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("model_deprecations_provider_model_id").on(table.provider, table.modelId)],
);
