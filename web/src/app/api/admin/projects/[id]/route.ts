import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { projectImages, projects } from "@/db/schema";
import { guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, fromZodError, handleRouteError } from "@/lib/http";

const patchSchema = z.object({
  slug: z.string().min(1).max(160).optional(),
  title: z.string().min(1).max(200).optional(),
  category: z.enum(["android", "flutter", "web"]).optional(),
  description: z.string().max(1000).nullable().optional(),
  longDescription: z.string().max(8000).nullable().optional(),
  problem: z.string().max(4000).nullable().optional(),
  solution: z.string().max(4000).nullable().optional(),
  architecture: z.string().max(4000).nullable().optional(),
  technologies: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  coverUrl: z.string().max(1000).nullable().optional(),
  thumbnailUrl: z.string().max(1000).nullable().optional(),
  videoUrl: z.string().max(1000).nullable().optional(),
  previewStyle: z.enum(["banner", "phone", "browser", "stack"]).optional(),
  playStoreLink: z.string().max(1000).nullable().optional(),
  liveLink: z.string().max(1000).nullable().optional(),
  githubLink: z.string().max(1000).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
  screenshots: z.array(z.string().max(1000)).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid project id.");

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing) return apiError("NOT_FOUND", "Project not found.");

    const { screenshots, ...rest } = parsed.data;
    const [updated] = await db
      .update(projects)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (screenshots) {
      await db.delete(projectImages).where(eq(projectImages.projectId, id));
      if (screenshots.length) {
        await db.insert(projectImages).values(
          screenshots.map((url, idx) => ({
            projectId: id,
            url,
            alt: `${updated.title} ${idx + 1}`,
            sortOrder: idx,
            isCover: idx === 0,
          })),
        );
      }
    }

    return apiOk({ project: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid project id.");

    await ensureSchema();
    const db = getDb();
    const deleted = await db.delete(projects).where(and(eq(projects.id, id))).returning();
    if (!deleted.length) return apiError("NOT_FOUND", "Project not found.");
    return apiOk({ deleted: true, id });
  } catch (err) {
    return handleRouteError(err);
  }
}
