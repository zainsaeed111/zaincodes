import { asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { blogCategories } from "@/db/schema";
import { slugify } from "@/lib/blog/sanitize";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, fromZodError, handleRouteError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const categories = await getDb().select().from(blogCategories).orderBy(asc(blogCategories.name));
    return apiOk({ categories });
  } catch (err) {
    return handleRouteError(err);
  }
}

const schema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().max(160).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);
    await ensureSchema();
    const db = getDb();
    const slug = slugify(parsed.data.slug || parsed.data.name);
    const [existing] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug)).limit(1);
    if (existing) return apiError("CONFLICT", "Category slug already exists.");
    const [category] = await db.insert(blogCategories).values({ slug, name: parsed.data.name }).returning();
    return apiOk({ category });
  } catch (err) {
    return handleRouteError(err);
  }
}
