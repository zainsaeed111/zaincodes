import { asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { projectImages, projects } from "@/db/schema";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, fromZodError, handleRouteError } from "@/lib/http";

const projectSchema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(200),
  category: z.enum(["android", "flutter", "web"]),
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

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const db = getDb();
    const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id));
    const images = await db.select().from(projectImages).orderBy(asc(projectImages.sortOrder));
    return apiOk({
      actor: session!.email,
      count: rows.length,
      projects: rows.map((p) => ({
        ...p,
        screenshots: images.filter((i) => i.projectId === p.id),
      })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = projectSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const data = parsed.data;
    const [inserted] = await db
      .insert(projects)
      .values({
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description || null,
        longDescription: data.longDescription || null,
        problem: data.problem || null,
        solution: data.solution || null,
        architecture: data.architecture || null,
        technologies: data.technologies || [],
        features: data.features || [],
        highlights: data.highlights || [],
        coverUrl: data.coverUrl || null,
        thumbnailUrl: data.thumbnailUrl || null,
        videoUrl: data.videoUrl || null,
        previewStyle: data.previewStyle || "banner",
        playStoreLink: data.playStoreLink || null,
        liveLink: data.liveLink || null,
        githubLink: data.githubLink || null,
        status: data.status || "draft",
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();

    if (data.screenshots?.length) {
      await db.insert(projectImages).values(
        data.screenshots.map((url, idx) => ({
          projectId: inserted.id,
          url,
          alt: `${data.title} ${idx + 1}`,
          sortOrder: idx,
          isCover: idx === 0,
        })),
      );
    }

    return apiOk({ project: inserted });
  } catch (err) {
    return handleRouteError(err);
  }
}
