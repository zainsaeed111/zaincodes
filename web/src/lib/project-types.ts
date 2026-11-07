import { asc, eq, inArray } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import { projectTypeLinks, projectTypes } from "@/db/schema";
import {
  CATEGORY_PRESETS,
  canonicalizeTypeSlug,
  humanizeCategory,
  slugifyCategory,
  type ProjectTypeRecord,
} from "@/lib/project-taxonomy";

export async function listProjectTypes(opts?: { includeDisabled?: boolean }) {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select().from(projectTypes).orderBy(asc(projectTypes.sortOrder), asc(projectTypes.id));
  if (opts?.includeDisabled) return rows;
  return rows.filter((r) => Number(r.enabled) === 1);
}

export async function getProjectTypeBySlug(slug: string) {
  const canonical = canonicalizeTypeSlug(slug);
  if (!canonical) return null;
  await ensureSchema();
  const db = getDb();
  const [row] = await db.select().from(projectTypes).where(eq(projectTypes.slug, canonical)).limit(1);
  return row || null;
}

export async function ensureProjectType(input: {
  slug: string;
  name?: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
}): Promise<ProjectTypeRecord> {
  await ensureSchema();
  const db = getDb();
  const slug = canonicalizeTypeSlug(input.slug) || slugifyCategory(input.slug);
  if (!slug) throw new Error("Invalid subcategory slug.");

  const [existing] = await db.select().from(projectTypes).where(eq(projectTypes.slug, slug)).limit(1);
  if (existing) return existing;

  const preset = CATEGORY_PRESETS.find((p) => p.id === slug);
  const [inserted] = await db
    .insert(projectTypes)
    .values({
      slug,
      name: input.name?.trim() || preset?.label || humanizeCategory(slug),
      description: input.description ?? preset?.blurb ?? "Custom project subcategory.",
      icon: input.icon || preset?.icon || "spark",
      sortOrder: input.sortOrder ?? 900,
      enabled: 1,
    })
    .returning();
  return inserted;
}

export async function syncProjectTypeLinks(projectId: number, typeSlugs: string[]) {
  await ensureSchema();
  const db = getDb();
  const unique = Array.from(
    new Set(typeSlugs.map((s) => canonicalizeTypeSlug(s) || slugifyCategory(s)).filter(Boolean)),
  );
  if (!unique.length) {
    throw new Error("At least one subcategory is required.");
  }

  const types: Array<{ id: number; slug: string }> = [];
  for (const slug of unique) {
    const row = await ensureProjectType({ slug });
    if (row.id == null) continue;
    types.push({ id: row.id, slug: row.slug });
  }

  await db.delete(projectTypeLinks).where(eq(projectTypeLinks.projectId, projectId));
  if (types.length) {
    await db.insert(projectTypeLinks).values(
      types.map((t, idx) => ({
        projectId,
        typeId: t.id,
        sortOrder: idx,
      })),
    );
  }
  return types.map((t) => t.slug);
}

export async function loadTypeSlugsForProjects(projectIds: number[]) {
  if (!projectIds.length) return new Map<number, string[]>();
  await ensureSchema();
  const db = getDb();
  const links = await db
    .select({
      projectId: projectTypeLinks.projectId,
      typeId: projectTypeLinks.typeId,
      sortOrder: projectTypeLinks.sortOrder,
      slug: projectTypes.slug,
    })
    .from(projectTypeLinks)
    .innerJoin(projectTypes, eq(projectTypeLinks.typeId, projectTypes.id))
    .where(inArray(projectTypeLinks.projectId, projectIds))
    .orderBy(asc(projectTypeLinks.sortOrder));

  const map = new Map<number, string[]>();
  for (const link of links) {
    const list = map.get(link.projectId) || [];
    list.push(link.slug);
    map.set(link.projectId, list);
  }
  return map;
}

export async function upsertProjectType(data: {
  id?: number;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  enabled?: number;
}) {
  await ensureSchema();
  const db = getDb();
  const slug = slugifyCategory(data.slug);
  if (!slug) throw new Error("Invalid slug.");

  if (data.id) {
    const [updated] = await db
      .update(projectTypes)
      .set({
        slug,
        name: data.name.trim(),
        description: data.description ?? null,
        icon: data.icon || "spark",
        sortOrder: data.sortOrder ?? 0,
        enabled: data.enabled ?? 1,
        updatedAt: new Date(),
      })
      .where(eq(projectTypes.id, data.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(projectTypes)
    .values({
      slug,
      name: data.name.trim(),
      description: data.description ?? null,
      icon: data.icon || "spark",
      sortOrder: data.sortOrder ?? 900,
      enabled: data.enabled ?? 1,
    })
    .returning();
  return inserted;
}
