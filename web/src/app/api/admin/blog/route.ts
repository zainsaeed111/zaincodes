import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import { blogCategories, blogPosts, blogPostTags, blogTags } from "@/db/schema";
import { isSlugTaken, normalizePostPayload, saveRevision, syncPostTags } from "@/lib/blog/admin";
import { revalidateBlogSurfaces } from "@/lib/blog/revalidate";
import { runBlogSeoChecklist } from "@/lib/blog/seo-check";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, fromZodError, handleRouteError } from "@/lib/http";
import { log } from "@/lib/log";

const postSchema = z.object({
  slug: z.string().min(1).max(160).optional(),
  title: z.string().min(1).max(240),
  excerpt: z.string().max(1000).nullable().optional(),
  body: z.string().max(200000).nullable().optional(),
  bodyHtml: z.string().max(200000).nullable().optional(),
  featuredImageUrl: z.string().max(1000).nullable().optional(),
  featuredImageAlt: z.string().max(300).nullable().optional(),
  categoryId: z.number().int().nullable().optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(400).nullable().optional(),
  canonicalUrl: z.string().max(1000).nullable().optional(),
  ogImageUrl: z.string().max(1000).nullable().optional(),
  authorName: z.string().max(120).nullable().optional(),
  authorBio: z.string().max(500).nullable().optional(),
  scheduledFor: z.string().nullable().optional(),
  tagNames: z.array(z.string().max(60)).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    await ensureSchema();
    const db = getDb();
    const posts = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        featuredImageUrl: blogPosts.featuredImageUrl,
        categoryId: blogPosts.categoryId,
        categoryName: blogCategories.name,
        publishedAt: blogPosts.publishedAt,
        scheduledFor: blogPosts.scheduledFor,
        updatedAt: blogPosts.updatedAt,
        contentVersion: blogPosts.contentVersion,
        readingMinutes: blogPosts.readingMinutes,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .orderBy(desc(blogPosts.updatedAt));
    const categories = await db.select().from(blogCategories);
    const tags = await db.select().from(blogTags);
    return apiOk({ posts, categories, tags, count: posts.length });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const normalized = normalizePostPayload(parsed.data);
    if (!normalized.title || !normalized.slug) {
      return apiError("VALIDATION_ERROR", "Title and slug are required.");
    }
    if (await isSlugTaken(normalized.slug)) {
      return apiError("CONFLICT", "Slug already exists.");
    }
    if (normalized.status === "scheduled" && !normalized.scheduledFor) {
      return apiError("VALIDATION_ERROR", "scheduledFor is required for scheduled posts.");
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        ...normalized,
        contentVersion: 1,
      })
      .returning();

    if (parsed.data.tagNames) await syncPostTags(post.id, parsed.data.tagNames);
    await saveRevision(post);

    const seo = runBlogSeoChecklist({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      bodyHtml: post.bodyHtml,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      canonicalUrl: post.canonicalUrl,
    });

    revalidateBlogSurfaces(post.slug);
    log.info("blog", "post created", { id: post.id, status: post.status, slug: post.slug });
    return apiOk({ post, seo });
  } catch (err) {
    log.error("blog", "create failed", { message: err instanceof Error ? err.message : "unknown" });
    return handleRouteError(err);
  }
}
