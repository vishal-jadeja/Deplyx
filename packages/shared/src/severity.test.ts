import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeSeverity } from "./severity";

const NOW = new Date("2026-07-30T12:00:00.000Z");
const WITH_REPLACEMENT = ["gpt-5-mini"];
const NO_REPLACEMENT: string[] = [];

describe("computeSeverity", () => {
  describe("date ladder (explicit `now` param — the pure-function path)", () => {
    it("is critical when shutdown_date is today or already past", () => {
      expect(computeSeverity({ shutdownDate: NOW, replacementModels: WITH_REPLACEMENT }, NOW)).toBe(
        "critical",
      );
      expect(
        computeSeverity(
          { shutdownDate: new Date("2026-01-01"), replacementModels: WITH_REPLACEMENT },
          NOW,
        ),
      ).toBe("critical");
    });

    it("is high when shutdown_date is within 30 days", () => {
      const in30Days = new Date("2026-08-29T12:00:00.000Z");
      expect(
        computeSeverity({ shutdownDate: in30Days, replacementModels: WITH_REPLACEMENT }, NOW),
      ).toBe("high");
    });

    it("is medium when shutdown_date is within 90 days but past the 30-day rung", () => {
      const in89Days = new Date("2026-10-27T12:00:00.000Z");
      expect(
        computeSeverity({ shutdownDate: in89Days, replacementModels: WITH_REPLACEMENT }, NOW),
      ).toBe("medium");
    });

    it("is low when shutdown_date is more than 90 days out", () => {
      const in91Days = new Date("2026-10-29T12:00:00.000Z");
      expect(
        computeSeverity({ shutdownDate: in91Days, replacementModels: WITH_REPLACEMENT }, NOW),
      ).toBe("low");
    });

    it("is medium (base case) when there is no shutdown_date at all", () => {
      expect(
        computeSeverity({ shutdownDate: null, replacementModels: WITH_REPLACEMENT }, NOW),
      ).toBe("medium");
    });
  });

  describe("no-replacement bump", () => {
    it("bumps low to medium", () => {
      const in91Days = new Date("2026-10-29T12:00:00.000Z");
      expect(
        computeSeverity({ shutdownDate: in91Days, replacementModels: NO_REPLACEMENT }, NOW),
      ).toBe("medium");
    });

    it("bumps medium (no shutdown_date) to high", () => {
      expect(computeSeverity({ shutdownDate: null, replacementModels: NO_REPLACEMENT }, NOW)).toBe(
        "high",
      );
    });

    it("bumps high to critical", () => {
      const in30Days = new Date("2026-08-29T12:00:00.000Z");
      expect(
        computeSeverity({ shutdownDate: in30Days, replacementModels: NO_REPLACEMENT }, NOW),
      ).toBe("critical");
    });

    it("caps at critical — does not overflow past it", () => {
      expect(computeSeverity({ shutdownDate: NOW, replacementModels: NO_REPLACEMENT }, NOW)).toBe(
        "critical",
      );
    });
  });

  describe("default `now` (frozen system clock, no explicit param)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("uses the frozen system clock when `now` is omitted", () => {
      expect(computeSeverity({ shutdownDate: NOW, replacementModels: WITH_REPLACEMENT })).toBe(
        "critical",
      );

      const in91Days = new Date("2026-10-29T12:00:00.000Z");
      expect(computeSeverity({ shutdownDate: in91Days, replacementModels: WITH_REPLACEMENT })).toBe(
        "low",
      );
    });
  });
});
