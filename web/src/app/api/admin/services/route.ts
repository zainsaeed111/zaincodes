import { asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { services } from "@/db/schema";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, fromZodError, handleRouteError } from "@/lib/http";

const schema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(200),
  summary: z.string().max(1000).nullable().optional(),
  body: z.string().max(20000).nullable().optional(),
  capabilities: z.array(z.string().min(1).max(80)).max(12).optional(),
  href: z.string().max(500).nullable().optional(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const rows = await getDb().select().from(services).orderBy(asc(services.sortOrder));
    return apiOk({ services: rows });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = z.array(schema).safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);
    await ensureSchema();
    const db = getDb();
    for (const [idx, svc] of parsed.data.entries()) {
      const existing = await db.select().from(services).where(eq(services.slug, svc.slug)).limit(1);
      const values = {
        title: svc.title,
        summary: svc.summary || null,
        body: svc.body || null,
        capabilities: svc.capabilities || [],
        href: svc.href?.trim() || null,
        status: svc.status,
        sortOrder: svc.sortOrder ?? idx,
        updatedAt: new Date(),
      };
      if (existing[0]) {
        await db.update(services).set(values).where(eq(services.id, existing[0].id));
      } else {
        await db.insert(services).values({ slug: svc.slug, ...values });
      }
    }
    const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
    return apiOk({ services: rows, saved: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
