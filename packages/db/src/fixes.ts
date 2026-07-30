import type { FixStatus } from "@deplyx/shared";
import { and, eq } from "drizzle-orm";
import { fixes } from "./schema/index.js";
import type { TenantDb } from "./tenant.js";

export class FixTransitionError extends Error {
  constructor(
    readonly fixId: string,
    readonly from: FixStatus,
    readonly to: FixStatus,
  ) {
    super(
      `Cannot transition fix ${fixId} from "${from}" to "${to}" — either the transition isn't ` +
        `legal, or the fix's status had already changed by the time this ran.`,
    );
    this.name = "FixTransitionError";
  }
}

/**
 * The fix status FSM as a table of legal transitions, not scattered `if`s
 * (design decision #12, docs/plans/02-db-schema-rls.md). Every terminal
 * state (`merged`, `closed`) has no outgoing edges; `failed` is reachable
 * from any in-flight state but not itself a dead end other states point
 * back into.
 */
const LEGAL_TRANSITIONS: Readonly<Record<FixStatus, readonly FixStatus[]>> = {
  detected: ["diff_generated", "failed"],
  diff_generated: ["approved", "failed"],
  approved: ["pr_open", "failed"],
  pr_open: ["merged", "closed", "failed"],
  merged: [],
  closed: [],
  failed: [],
};

/**
 * Transitions a fix's status with the database itself as the concurrency
 * guard: a single conditional `UPDATE ... WHERE id = $fixId AND status =
 * $from`. Zero rows affected — whether because the fix doesn't exist, or
 * because its status had already moved on since the caller last read it —
 * throws `FixTransitionError` rather than silently doing nothing or
 * clobbering a concurrent writer's state.
 */
export async function transitionFix(
  db: TenantDb,
  fixId: string,
  from: FixStatus,
  to: FixStatus,
): Promise<void> {
  if (!LEGAL_TRANSITIONS[from].includes(to)) {
    throw new FixTransitionError(fixId, from, to);
  }

  const result = await db
    .update(fixes)
    .set({ status: to, updatedAt: new Date() })
    .where(and(eq(fixes.id, fixId), eq(fixes.status, from)))
    .returning({ id: fixes.id });

  if (result.length === 0) {
    throw new FixTransitionError(fixId, from, to);
  }
}
