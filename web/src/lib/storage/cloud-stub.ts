import type { StorageAdapter } from "./types";

/**
 * Future cloud adapter placeholder (S3/R2/Supabase Storage).
 * Not used in local Phase 2 — marked BLOCKED until cloud credentials exist.
 */
export function createCloudStorageAdapter(): StorageAdapter {
  throw new Error(
    "Cloud storage adapter is not configured. Local adapter is active. Provision STORAGE_* credentials before enabling cloud mode.",
  );
}
