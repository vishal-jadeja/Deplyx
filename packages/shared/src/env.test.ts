import { afterEach, describe, expect, it } from "vitest";
import { _resetEnvCacheForTests, getEnv } from "./env";

const REQUIRED = {
  APP_DATABASE_URL: "postgresql://app:pw@host/db",
  WORKER_DATABASE_URL: "postgresql://worker:pw@host/db",
};

describe("getEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    _resetEnvCacheForTests();
  });

  it("parses successfully when required vars are present", () => {
    process.env = { ...process.env, ...REQUIRED };
    _resetEnvCacheForTests();
    const env = getEnv();
    expect(env.APP_DATABASE_URL).toBe(REQUIRED.APP_DATABASE_URL);
    expect(env.WORKER_DATABASE_URL).toBe(REQUIRED.WORKER_DATABASE_URL);
    expect(env.NODE_ENV).toBe("test"); // vitest sets NODE_ENV=test
  });

  it("throws a clear error when a required var is missing", () => {
    process.env = { ...process.env };
    delete process.env.APP_DATABASE_URL;
    delete process.env.WORKER_DATABASE_URL;
    _resetEnvCacheForTests();
    expect(() => getEnv()).toThrow(/APP_DATABASE_URL/);
  });

  it("throws a clear error when a var is malformed", () => {
    process.env = { ...process.env, ...REQUIRED, APP_DATABASE_URL: "not-a-url" };
    _resetEnvCacheForTests();
    expect(() => getEnv()).toThrow(/APP_DATABASE_URL/);
  });

  it("caches the parsed result across calls", () => {
    process.env = { ...process.env, ...REQUIRED };
    _resetEnvCacheForTests();
    const a = getEnv();
    const b = getEnv();
    expect(a).toBe(b);
  });
});
