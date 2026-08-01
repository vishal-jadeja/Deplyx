import { auth } from "@/auth";

/**
 * Every request-path DB call needs a resolved `userId` to hand to
 * `withTenant()` — this is the one place that resolves it from the Auth.js
 * session, so callers can't accidentally read `session.user.id` without the
 * missing-session case being handled.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("requireUserId: no authenticated session.");
  }
  return userId;
}
