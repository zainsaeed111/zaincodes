import { createLocalStorageAdapter } from "./local";
import { createS3StorageAdapter } from "./s3";
import type { StorageAdapter, StorageKind } from "./types";

export type { StorageAdapter, StorageKind, StoredObject } from "./types";

export const ALLOWED_UPLOADS: Record<
  StorageKind,
  { maxBytes: number; mimeTypes: string[] }
> = {
  resumes: {
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["application/pdf"],
  },
  projects: {
    maxBytes: 40 * 1024 * 1024,
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
  },
  blog: {
    maxBytes: 6 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
  brand: {
    maxBytes: 4 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  },
};

let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  const mode = (process.env.STORAGE_DRIVER || "local").toLowerCase();
  if (mode === "local") {
    cached = createLocalStorageAdapter();
    return cached;
  }
  if (mode === "s3" || mode === "r2") {
    cached = createS3StorageAdapter();
    return cached;
  }
  throw new Error(`Unsupported STORAGE_DRIVER "${mode}". Use local, s3, or r2.`);
}

export function storageDriverName() {
  return (process.env.STORAGE_DRIVER || "local").toLowerCase();
}

export function isPdfBuffer(buf: Buffer) {
  return buf.length >= 5 && buf.subarray(0, 5).toString("utf8") === "%PDF-";
}
