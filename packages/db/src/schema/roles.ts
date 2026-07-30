import { pgRole } from "drizzle-orm/pg-core";

/**
 * The application role. Created out-of-band by `scripts/create-app-role.ts`
 * (idempotent, reads APP_DB_PASSWORD from env) because migrations are static
 * SQL files and cannot read secrets — committing a password to a migration
 * is disqualifying. `.existing()` tells drizzle-kit this role already exists
 * so it emits policies/grants referencing it without trying to `CREATE
 * ROLE`. See docs/plans/02-db-schema-rls.md, architecture decision #1.
 */
export const appRole = pgRole("deplyx_app").existing();
