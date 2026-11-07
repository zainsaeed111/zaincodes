import { asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { projectImages, projects } from "@/db/schema";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, fromZodError, handleRouteError } from "@/lib/http";
import { showcaseFieldsSchema, toFlag } from "@/lib/project-showcase-schema";
import { canonicalizeTypeSlug, slugifyCategory } from "@/lib/project-taxonomy";
import { loadTypeSlugsForProjects, syncProjectTypeLinks } from "@/lib/project-types";

const projectSchema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(64).optional(),
  typeSlugs: z.array(z.string().min(1).max(64)).min(1).optional(),
  workContext: z.enum(["client", "personal", "unassigned"]).optional(),
  needsGroupReview: z.union([z.boolean(), z.number()]).optional(),
  categoryIcon: z.string().max(40).nullable().optional(),
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
  ...showcaseFieldsSchema,
});

function resolveTypeSlugs(data: z.infer<typeof projectSchema>) {
  const fromArray = (data.typeSlugs || []).map((s) => canonicalizeTypeSlug(s) || slugifyCategory(s)).filter(Boolean);
  if (fromArray.length) return Array.from(new Set(fromArray));
  const single = canonicalizeTypeSlug(data.category) || slugifyCategory(data.category || "");
  if (!single) throw new Error("At least one subcategory is required.");
  return [single];
}

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const db = getDb();
    const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id));
    const images = await db.select().from(projectImages).orderBy(asc(projectImages.sortOrder));
    const typeMap = await loadTypeSlugsForProjects(rows.map((r) => r.id));
    return apiOk({
      actor: session!.email,
      count: rows.length,
      projects: rows.map((p) => ({
        ...p,
        typeSlugs: typeMap.get(p.id) || [canonicalizeTypeSlug(p.category) || p.category],
        screenshots: images.filter((i) => i.projectId === p.id),
        shotUrls: images.filter((i) => i.projectId === p.id).map((i) => i.url),
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
    let typeSlugs: string[];
    try {
      typeSlugs = resolveTypeSlugs(data);
    } catch (e) {
      return fromZodError(
        z.object({ typeSlugs: z.array(z.string()).min(1) }).safeParse({ typeSlugs: [] }).error!,
      );
    }

    const workContext = data.workContext || "unassigned";
    const needsReview =
      workContext === "unassigned" ? 1 : toFlag(data.needsGroupReview, 0);

    const [inserted] = await db
      .insert(projects)
      .values({
        slug: data.slug,
        title: data.title,
        category: typeSlugs[0],
        workContext,
        needsGroupReview: needsReview,
        categoryIcon: data.categoryIcon || null,
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
        videoPosterUrl: data.videoPosterUrl || null,
        previewStyle: data.previewStyle || "banner",
        showcaseMode: data.showcaseMode || "static",
        showcaseAutoplay: toFlag(data.showcaseAutoplay, 1),
        slideshowIntervalMs: data.slideshowIntervalMs ?? 4200,
        imageFit: data.imageFit || "cover",
        bannerAspect: data.bannerAspect || "16/10",
        scrollPreview: toFlag(data.scrollPreview, 0),
        showcaseImageOrder: data.showcaseImageOrder || [],
        isFeatured: toFlag(data.isFeatured, 0),
        playStoreLink: data.playStoreLink || null,
        liveLink: data.liveLink || null,
        githubLink: data.githubLink || null,
        status: data.status || "draft",
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();

    await syncProjectTypeLinks(inserted.id, typeSlugs);

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

    const { revalidateSiteSurfaces } = await import("@/lib/cms-revalidate");
    revalidateSiteSurfaces({ projectSlug: inserted.slug });
    return apiOk({ project: { ...inserted, typeSlugs } });
  } catch (err) {
    return handleRouteError(err);
  }
}
