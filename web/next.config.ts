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
  serverExternalPackages: ["@electric-sql/pglite", "postgres", "@aws-sdk/client-s3"],
};

export default nextConfig;
