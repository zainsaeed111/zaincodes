import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getWebRoot } from "@/db/client";
import type { StorageAdapter, StorageKind, StoredObject } from "./types";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function uploadsRoot() {
  const root = path.join(getWebRoot(), ".data", "uploads");
  return root;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

function assertSafeKey(key: string) {
  if (!key || key.includes("..") || path.isAbsolute(key) || key.startsWith("/") || key.startsWith("\\")) {
    throw new Error("Invalid storage key.");
  }
  const normalized = key.replace(/\\/g, "/");
  if (!/^(resumes|projects|blog|brand)\/[A-Za-z0-9._/-]+$/.test(normalized)) {
    throw new Error("Invalid storage key namespace.");
  }
  return normalized;
}

export function createLocalStorageAdapter(): StorageAdapter {
  return {
    name: "local",
    async put(kind: StorageKind, filename: string, data: Buffer, mimeType: string): Promise<StoredObject> {
      const safeName = sanitizeFilename(filename);
      const key = `${kind}/${randomUUID()}-${safeName}`;
      const absolutePath = path.join(uploadsRoot(), key);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, data);
      return {
        key,
        absolutePath,
        publicPath: `/api/media/${key}`,
        bytes: data.byteLength,
        mimeType,
        filename: safeName,
      };
    },
    async delete(key: string) {
      const safe = assertSafeKey(key);
      const absolutePath = path.join(uploadsRoot(), safe);
      await fs.rm(absolutePath, { force: true });
    },
    async exists(key: string) {
      const safe = assertSafeKey(key);
      try {
        await fs.access(path.join(uploadsRoot(), safe));
        return true;
      } catch {
        return false;
      }
    },
    async read(key: string) {
      const safe = assertSafeKey(key);
      const absolutePath = path.join(uploadsRoot(), safe);
      try {
        const data = await fs.readFile(absolutePath);
        const ext = path.extname(safe).toLowerCase();
        return {
          data,
          mimeType: MIME_BY_EXT[ext] || "application/octet-stream",
          filename: path.basename(safe),
        };
      } catch {
        return null;
      }
    },
  };
}

export { assertSafeKey, uploadsRoot };
