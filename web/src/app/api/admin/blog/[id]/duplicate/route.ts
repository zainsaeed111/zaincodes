import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { ensureSchema, getDb } from "@/db/client";
import { blogPosts, blogPostTags, blogTags } from "@/db/schema";
import { isSlugTaken, saveRevision, syncPostTags } from "@/lib/blog/admin";
import { slugify } from "@/lib/blog/sanitize";
import { guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, handleRouteError } from "@/lib/http";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid id.");
    await ensureSchema();
    const db = getDb();
    const [source] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!source) return apiError("NOT_FOUND", "Post not found.");

    let base = `${source.slug}-copy`;
    let slug = slugify(base);
    let n = 2;
    while (await isSlugTaken(slug)) {
      slug = slugify(`${base}-${n++}`);
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        slug,
        title: `${source.title} (Copy)`,
        excerpt: source.excerpt,
        body: source.body,
        bodyHtml: source.bodyHtml,
        featuredImageUrl: source.featuredImageUrl,
        featuredImageAlt: source.featuredImageAlt,
        categoryId: source.categoryId,
        status: "draft",
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        canonicalUrl: null,
        ogImageUrl: source.ogImageUrl,
        authorName: source.authorName,
        authorBio: source.authorBio,
        readingMinutes: source.readingMinutes,
        contentVersion: 1,
        scheduledFor: null,
        publishedAt: null,
      })
      .returning();

    const tags = await db
      .select({ name: blogTags.name })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, id));
    await syncPostTags(
      post.id,
      tags.map((t) => t.name),
    );
    await saveRevision(post);
    return apiOk({ post });
  } catch (err) {
    return handleRouteError(err);
  }
}
