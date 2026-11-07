import { asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { projectTypes } from "@/db/schema";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, fromZodError, handleRouteError } from "@/lib/http";
import { slugifyCategory } from "@/lib/project-taxonomy";
import { upsertProjectType } from "@/lib/project-types";

const typeSchema = z.object({
  id: z.number().int().optional(),
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  sortOrder: z.number().int().optional(),
  enabled: z.union([z.boolean(), z.number()]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const db = getDb();
    const rows = await db.select().from(projectTypes).orderBy(asc(projectTypes.sortOrder), asc(projectTypes.id));
    return apiOk({ actor: session!.email, types: rows });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = typeSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    const data = parsed.data;
    const row = await upsertProjectType({
      id: data.id,
      slug: slugifyCategory(data.slug),
      name: data.name,
      description: data.description,
      icon: data.icon,
      sortOrder: data.sortOrder,
      enabled: data.enabled === false || data.enabled === 0 ? 0 : 1,
    });

    const { revalidateSiteSurfaces } = await import("@/lib/cms-revalidate");
    revalidateSiteSurfaces();
    return apiOk({ type: row });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const body = z.object({ id: z.number().int() }).safeParse(await req.json());
    if (!body.success) return fromZodError(body.error);

    await ensureSchema();
    const db = getDb();
    // Soft-disable instead of hard-delete so existing links stay valid.
    const [updated] = await db
      .update(projectTypes)
      .set({ enabled: 0, updatedAt: new Date() })
      .where(eq(projectTypes.id, body.data.id))
      .returning();

    const { revalidateSiteSurfaces } = await import("@/lib/cms-revalidate");
    revalidateSiteSurfaces();
    return apiOk({ type: updated, disabled: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
