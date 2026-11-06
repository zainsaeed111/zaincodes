import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureSchema, getDb } from "@/db/client";
import { blogPostRevisions, blogPosts } from "@/db/schema";
import { saveRevision } from "@/lib/blog/admin";
import { revalidateBlogSurfaces } from "@/lib/blog/revalidate";
import { estimateReadingMinutes, htmlToPlainText, sanitizeBlogHtml } from "@/lib/blog/sanitize";
import { guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, handleRouteError } from "@/lib/http";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; revisionId: string }> },
) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const { id: idRaw, revisionId: revRaw } = await context.params;
    const id = Number(idRaw);
    const revisionId = Number(revRaw);
    if (!Number.isFinite(id) || !Number.isFinite(revisionId)) {
      return apiError("BAD_REQUEST", "Invalid id.");
    }
    await ensureSchema();
    const db = getDb();
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing) return apiError("NOT_FOUND", "Post not found.");
    const [rev] = await db
      .select()
      .from(blogPostRevisions)
      .where(and(eq(blogPostRevisions.id, revisionId), eq(blogPostRevisions.postId, id)))
      .limit(1);
    if (!rev) return apiError("NOT_FOUND", "Revision not found.");

    await saveRevision(existing);
    const bodyHtml = sanitizeBlogHtml(rev.bodyHtml || "");
    const [post] = await db
      .update(blogPosts)
      .set({
        title: rev.title,
        slug: rev.slug,
        excerpt: rev.excerpt,
        bodyHtml,
        body: htmlToPlainText(bodyHtml).slice(0, 100000),
        readingMinutes: estimateReadingMinutes(bodyHtml),
        contentVersion: existing.contentVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    await saveRevision(post);
    revalidateBlogSurfaces(post.slug);
    if (existing.slug !== post.slug) revalidateBlogSurfaces(existing.slug);
    return apiOk({ post, restoredFrom: rev.id });
  } catch (err) {
    return handleRouteError(err);
  }
}
