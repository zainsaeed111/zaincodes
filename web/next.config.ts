import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this app when the monorepo has a parent lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
  // Local browser tooling may open 127.0.0.1 while Next serves localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Keep native/server-only packages out of the client bundle.
  serverExternalPackages: ["@electric-sql/pglite", "@neondatabase/serverless", "@aws-sdk/client-s3"],
};

async function loadConfig(): Promise<NextConfig> {
  // Only for Cloudflare Workers local preview — skip for normal next/Vercel (avoids Hyperdrive noise).
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    process.env.CF_DEV === "1"
  ) {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  }
  return nextConfig;
}

export default loadConfig();
