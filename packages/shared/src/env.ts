import { z } from "zod";

/**
 * Full environment contract for Deplyx, across every phase of the roadmap
 * (docs/plans/00-ROADMAP.md). Not every var is consumed yet in Phase 01 —
 * the schema exists up front so each later phase only has to *read* env,
 * never redefine its shape.
 *
 * Parsing is lazy (see `getEnv()` below), NOT run at module import time.
 * A phase's code should call `getEnv()` the moment it actually needs a var;
 * that is when a missing/malformed value throws a clear, typed error. This
 * keeps `pnpm dev` bootable in Phase 01 without every downstream secret
 * (GitHub App key, Trigger.dev, encryption key, ...) already being filled in.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Database (Neon) ---
  // Owner connection. RLS BYPASSED. Only for db:role / db:migrate scripts.
  DATABASE_URL: z.url().optional(),
  // Application role. RLS ENFORCED. Only client allowed on the request path.
  APP_DATABASE_URL: z.url(),
  // Privileged role. RLS BYPASSED. Only client allowed inside Trigger.dev tasks.
  WORKER_DATABASE_URL: z.url(),
  APP_DB_PASSWORD: z.string().min(1).optional(),

  // --- Redis (Upstash) ---
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // --- Trigger.dev ---
  TRIGGER_SECRET_KEY: z.string().min(1).optional(),
  TRIGGER_PROJECT_ID: z.string().min(1).optional(),

  // --- Auth.js v5 ---
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.url().optional(),
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),

  // --- GitHub App ---
  GITHUB_APP_ID: z.string().min(1).optional(),
  GITHUB_APP_SLUG: z.string().min(1).optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1).optional(),
  GITHUB_APP_WEBHOOK_SECRET: z.string().min(1).optional(),

  // --- Encryption (BYOK provider keys, AES-256-GCM master key) ---
  ENCRYPTION_MASTER_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validate and return process.env against the Deplyx contract. Throws a
 * ZodError with a readable field-level message on first invalid access;
 * cached after the first successful parse.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

/** Test-only: clear the cached parse so a test can re-parse a mutated env. */
export function _resetEnvCacheForTests(): void {
  cached = undefined;
}
