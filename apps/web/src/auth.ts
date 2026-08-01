import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "@deplyx/db";
import { workerDb } from "@deplyx/db/worker";
import { getEnv } from "@deplyx/shared/env";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * The Auth.js adapter tables have zero grants to `deplyx_app` and no RLS
 * policies at all (accounts/sessions/verification_tokens); `users` itself
 * needs a bypass too, since account creation has no `app.user_id` yet to
 * scope by. `workerDb()` is the one client with that access — see its
 * docstring (`packages/db/src/worker.ts`) and the trust-boundary section of
 * the root CLAUDE.md for the full list of call sites allowed to import it.
 */
const env = getEnv();

/**
 * `@auth/drizzle-adapter`'s expected table shape (`DefaultPostgresUsersTable`
 * etc., verified against the installed package's source) is the type of a
 * table straight out of `pgTable()`, which still carries the chainable
 * `enableRLS()` builder method. Our schema calls `.enableRLS()` at
 * definition time (packages/db/src/schema/*.ts) — its return type strips
 * that method off on purpose, so the exported tables no longer structurally
 * match. This is a TS-only artifact of drizzle's builder-chain typing, not a
 * real shape mismatch: the adapter only ever touches columns, never calls
 * `.enableRLS()` itself. Casting through the adapter's own parameter type
 * (not a hand-rolled one) keeps this pinned to whatever the installed
 * package actually expects.
 */
type AdapterSchema = NonNullable<Parameters<typeof DrizzleAdapter<ReturnType<typeof workerDb>>>[1]>;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(workerDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  } as unknown as AdapterSchema),
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    // Database-strategy sessions don't attach `user.id` to `session.user` by
    // default — every request-path query needs it to call withTenant(), so
    // it has to be threaded through explicitly here.
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
