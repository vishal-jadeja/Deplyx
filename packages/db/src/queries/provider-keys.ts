import type { LlmProvider } from "@deplyx/shared";
import { eq } from "drizzle-orm";
import { providerKeys } from "../schema/index";
import type { TenantDb } from "../tenant";

/**
 * Deliberately excludes `encrypted_key` — this is the "never selected on
 * the request path" guarantee from decision #11
 * (docs/plans/02-db-schema-rls.md). Phase 07 implements the actual
 * encrypt/decrypt; this phase only guards the read shape.
 */
export async function listProviderKeysPublic(db: TenantDb) {
  return db
    .select({
      id: providerKeys.id,
      userId: providerKeys.userId,
      provider: providerKeys.provider,
      keyVersion: providerKeys.keyVersion,
      lastFour: providerKeys.lastFour,
      createdAt: providerKeys.createdAt,
    })
    .from(providerKeys);
}

export async function getProviderKeyByProvider(db: TenantDb, provider: LlmProvider) {
  const rows = await db.select().from(providerKeys).where(eq(providerKeys.provider, provider));
  return rows[0];
}
