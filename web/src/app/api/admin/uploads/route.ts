import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { mediaAssets, resumeAssets } from "@/db/schema";
import { requireAdminMutation } from "@/lib/auth";
import { apiError, apiOk, handleRouteError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { ALLOWED_UPLOADS, getStorage, isPdfBuffer, type StorageKind } from "@/lib/storage";
import { eq } from "drizzle-orm";

const kindSchema = z.enum(["resumes", "projects", "blog", "brand"]);

export async function POST(req: NextRequest) {
  try {
    const { session, csrfOk } = await requireAdminMutation(req);
    if (!session) return apiError("UNAUTHORIZED", "Unauthorized");
    if (!csrfOk) return apiError("FORBIDDEN", "CSRF validation failed.");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limited = rateLimit(`upload:${session.sub}:${ip}`, 20, 60 * 1000);
    if (!limited.allowed) return apiError("RATE_LIMITED", "Upload rate limit exceeded.");

    const form = await req.formData();
    const kindRaw = String(form.get("kind") || "");
    const kindParsed = kindSchema.safeParse(kindRaw);
    if (!kindParsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid upload kind.");
    }
    const kind = kindParsed.data as StorageKind;
    const file = form.get("file");
    if (!(file instanceof File)) {
      return apiError("BAD_REQUEST", "Missing file field.");
    }

    const rules = ALLOWED_UPLOADS[kind];
    if (!rules.mimeTypes.includes(file.type)) {
      return apiError("VALIDATION_ERROR", `MIME type ${file.type || "unknown"} not allowed for ${kind}.`);
    }
    const imageMax = 8 * 1024 * 1024;
    const isVideo = file.type.startsWith("video/");
    const maxBytes = kind === "projects" && isVideo ? rules.maxBytes : kind === "projects" ? imageMax : rules.maxBytes;
    if (file.size > maxBytes) {
      return apiError(
        "VALIDATION_ERROR",
        isVideo
          ? `Video exceeds ${Math.round(maxBytes / (1024 * 1024))}MB limit.`
          : `File exceeds ${Math.round(maxBytes / (1024 * 1024))}MB limit.`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (kind === "resumes" && !isPdfBuffer(buffer)) {
      return apiError("VALIDATION_ERROR", "Resume must be a valid PDF (magic bytes).");
    }

    const storage = getStorage();
    const stored = await storage.put(kind, file.name || "upload.bin", buffer, file.type);

    await ensureSchema();
    const db = getDb();
    await db.insert(mediaAssets).values({
      storageKey: stored.key,
      filename: stored.filename,
      mimeType: stored.mimeType,
      bytes: stored.bytes,
      kind,
    });

    if (kind === "resumes") {
      await db.update(resumeAssets).set({ isCurrent: false }).where(eq(resumeAssets.isCurrent, true));
      const [resume] = await db
        .insert(resumeAssets)
        .values({
          storageKey: stored.key,
          filename: stored.filename,
          mimeType: stored.mimeType,
          bytes: stored.bytes,
          isCurrent: true,
        })
        .returning();

      return apiOk({
        uploaded: {
          key: stored.key,
          url: stored.publicPath,
          filename: stored.filename,
          bytes: stored.bytes,
          mimeType: stored.mimeType,
          kind,
        },
        resume: {
          id: resume.id,
          filename: resume.filename,
          url: "/api/resume",
        },
      });
    }

    return apiOk({
      uploaded: {
        key: stored.key,
        url: stored.publicPath,
        filename: stored.filename,
        bytes: stored.bytes,
        mimeType: stored.mimeType,
        kind,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
