import { Webhooks } from "@octokit/webhooks";
import { describe, expect, it } from "vitest";

/**
 * Exercises `@octokit/webhooks`'s own sign/verify contract directly (not our
 * `getGithubWebhooks()` wrapper, which needs a real GitHub App private key
 * to construct) — this is the exact mechanism
 * `apps/web/src/app/api/github/webhooks/route.ts` relies on for
 * `verifyAndReceive`, so it's worth confirming the assumption rather than
 * taking it on faith.
 */
describe("webhook signature verification", () => {
  const webhooks = new Webhooks({ secret: "test-secret" });

  it("accepts a payload signed with the matching secret", async () => {
    const payload = JSON.stringify({ action: "created" });
    const signature = await webhooks.sign(payload);
    await expect(webhooks.verify(payload, signature)).resolves.toBe(true);
  });

  it("rejects a payload signed with a different secret", async () => {
    const other = new Webhooks({ secret: "wrong-secret" });
    const payload = JSON.stringify({ action: "created" });
    const signature = await other.sign(payload);
    await expect(webhooks.verify(payload, signature)).resolves.toBe(false);
  });

  it("rejects a tampered payload even with a validly-formed signature", async () => {
    const payload = JSON.stringify({ action: "created" });
    const signature = await webhooks.sign(payload);
    const tampered = JSON.stringify({ action: "deleted" });
    await expect(webhooks.verify(tampered, signature)).resolves.toBe(false);
  });
});
