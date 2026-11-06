import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { getSeo } from "@/lib/content";
import { apiError, apiOk, handleRouteError } from "@/lib/http";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    await ensureSchema();
    const db = getDb();
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
      .limit(1);
    if (!post) return apiError("NOT_FOUND", "Article not found.");
    const seo = await getSeo("post", slug);
    return apiOk({ post, seo });
  } catch (err) {
    return handleRouteError(err);
  }
}
