import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Internal workspace packages are consumed as TS source, not prebuilt —
  // Next transpiles them itself rather than requiring each package to ship
  // its own build step.
  transpilePackages: ["@deplyx/shared", "@deplyx/db", "@deplyx/github"],
};

export default nextConfig;
