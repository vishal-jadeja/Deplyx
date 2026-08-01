import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { findings, githubInstallations, repositories, users } from "../src/schema/index";
import { SEED_USERS } from "../src/seed-fixtures";

/**
 * Seeds 2 users, 1 GitHub installation + repository + finding each — the
 * fixture `packages/db/test/rls.test.ts` (Task 8) exercises: user A's
 * `withTenant` query must return only A's finding, never B's.
 *
 * Runs on `DATABASE_URL` (owner, RLS-bypassed — design decision 6) because
 * it writes two different tenants' rows in one pass; `deplyx_app` couldn't
 * do that even if we wanted it to, by design.
 *
 * Idempotent: deletes any prior run's seed users first. Every downstream
 * row (installation, repository, finding) cascades away with them via
 * `ON DELETE CASCADE`, so this is a full wipe-and-reseed of just the seed
 * fixture — not a truncate of the whole database.
 */

// scripts/ runs with cwd = packages/db; the root .env lives two levels up.
loadEnv({ path: resolve(process.cwd(), "../../.env") });

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required (owner connection — see .env.example).");
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });
  const db = drizzle(sql, { schema: { users, githubInstallations, repositories, findings } });

  try {
    await db.delete(users).where(
      inArray(
        users.email,
        SEED_USERS.map((s) => s.email),
      ),
    );

    for (const seed of SEED_USERS) {
      const [user] = await db.insert(users).values({ email: seed.email }).returning();
      if (!user) throw new Error(`Failed to insert seed user ${seed.email}`);

      const [installation] = await db
        .insert(githubInstallations)
        .values({
          userId: user.id,
          installationId: seed.installationId,
          accountLogin: seed.accountLogin,
          accountType: "Organization",
        })
        .returning();
      if (!installation) throw new Error(`Failed to insert installation for ${seed.email}`);

      const [repository] = await db
        .insert(repositories)
        .values({
          userId: user.id,
          installationId: installation.id,
          githubRepoId: seed.githubRepoId,
          owner: seed.accountLogin,
          name: seed.repoName,
          defaultBranch: "main",
        })
        .returning();
      if (!repository) throw new Error(`Failed to insert repository for ${seed.email}`);

      await db.insert(findings).values({
        userId: user.id,
        repositoryId: repository.id,
        kind: "ai_model",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        matchedValue: seed.matchedValue,
        severity: "high",
      });

      process.stdout.write(`Seeded ${seed.email} (${seed.repoName}).\n`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
