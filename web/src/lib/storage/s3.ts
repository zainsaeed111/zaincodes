import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { StorageAdapter, StorageKind, StoredObject } from "./types";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

function assertSafeKey(key: string) {
  if (!key || key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
    throw new Error("Invalid storage key.");
  }
  const normalized = key.replace(/\\/g, "/");
  if (!/^(resumes|projects|blog|brand)\/[A-Za-z0-9._/-]+$/.test(normalized)) {
    throw new Error("Invalid storage key namespace.");
  }
  return normalized;
}

function requiredEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name} for S3/R2 storage.`);
  return v;
}

export function createS3StorageAdapter(): StorageAdapter {
  const bucket = requiredEnv("S3_BUCKET");
  const region = process.env.S3_REGION?.trim() || "auto";
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const publicBase = process.env.S3_PUBLIC_URL?.trim().replace(/\/$/, "");
  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: requiredEnv("S3_ACCESS_KEY"),
      secretAccessKey: requiredEnv("S3_SECRET_KEY"),
    },
  });

  function publicPathFor(key: string) {
    if (publicBase) return `${publicBase}/${key}`;
    return `/api/media/${key}`;
  }

  return {
    name: "s3",
    async put(kind: StorageKind, filename: string, data: Buffer, mimeType: string): Promise<StoredObject> {
      const safeName = sanitizeFilename(filename);
      const key = `${kind}/${randomUUID()}-${safeName}`;
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: data,
          ContentType: mimeType,
        }),
      );
      return {
        key,
        absolutePath: `s3://${bucket}/${key}`,
        publicPath: publicPathFor(key),
        bytes: data.byteLength,
        mimeType,
        filename: safeName,
      };
    },
    async delete(key: string) {
      const safe = assertSafeKey(key);
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: safe }));
    },
    async exists(key: string) {
      const safe = assertSafeKey(key);
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: safe }));
        return true;
      } catch {
        return false;
      }
    },
    async read(key: string) {
      const safe = assertSafeKey(key);
      try {
        const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: safe }));
        const bytes = await out.Body?.transformToByteArray();
        if (!bytes) return null;
        return {
          data: Buffer.from(bytes),
          mimeType: out.ContentType || "application/octet-stream",
          filename: safe.split("/").pop() || "file",
        };
      } catch {
        return null;
      }
    },
  };
}

export function s3Configured() {
  const mode = (process.env.STORAGE_DRIVER || "").toLowerCase();
  return (
    (mode === "s3" || mode === "r2") &&
    Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY)
  );
}
