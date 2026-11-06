import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  blogPostRevisions,
  blogPosts,
  blogPostTags,
  blogSlugRedirects,
  blogTags,
} from "@/db/schema";
import { estimateReadingMinutes, htmlToPlainText, sanitizeBlogHtml, slugify } from "./sanitize";

const MAX_REVISIONS = 30;

export type BlogPostInput = {
  slug?: string;
  title?: string;
  excerpt?: string | null;
  body?: string | null;
  bodyHtml?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  categoryId?: number | null;
  status?: "draft" | "published" | "scheduled";
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  authorName?: string | null;
  authorBio?: string | null;
  scheduledFor?: string | Date | null;
  tagNames?: string[];
  contentVersion?: number;
  expectedVersion?: number;
};

export async function isSlugTaken(slug: string, excludeId?: number) {
  const db = getDb();
  const rows = excludeId
    ? await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), ne(blogPosts.id, excludeId)))
        .limit(1)
    : await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return rows.length > 0;
}

export async function syncPostTags(postId: number, tagNames: string[] = []) {
  const db = getDb();
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));
  const cleaned = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))].slice(0, 20);
  for (const name of cleaned) {
    const slug = slugify(name);
    if (!slug) continue;
    let [tag] = await db.select().from(blogTags).where(eq(blogTags.slug, slug)).limit(1);
    if (!tag) {
      [tag] = await db.insert(blogTags).values({ slug, name }).returning();
    }
    await db.insert(blogPostTags).values({ postId, tagId: tag.id });
  }
}

export async function saveRevision(post: typeof blogPosts.$inferSelect) {
  const db = getDb();
  await db.insert(blogPostRevisions).values({
    postId: post.id,
    version: post.contentVersion,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    bodyHtml: post.bodyHtml || post.body,
    meta: {
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: post.status,
      featuredImageUrl: post.featuredImageUrl,
    },
  });
  const all = await db
    .select({ id: blogPostRevisions.id })
    .from(blogPostRevisions)
    .where(eq(blogPostRevisions.postId, post.id))
    .orderBy(desc(blogPostRevisions.version));
  if (all.length > MAX_REVISIONS) {
    const drop = all.slice(MAX_REVISIONS);
    for (const row of drop) {
      await db.delete(blogPostRevisions).where(eq(blogPostRevisions.id, row.id));
    }
  }
}

export function normalizePostPayload(data: BlogPostInput, existing?: typeof blogPosts.$inferSelect) {
  const title = (data.title ?? existing?.title ?? "").trim();
  const slug = slugify(data.slug ?? existing?.slug ?? title);
  const bodyHtml = sanitizeBlogHtml(data.bodyHtml ?? data.body ?? existing?.bodyHtml ?? existing?.body ?? "");
  const plain = htmlToPlainText(bodyHtml);
  const status = data.status ?? (existing?.status as "draft" | "published" | "scheduled") ?? "draft";
  let scheduledFor: Date | null = null;
  if (data.scheduledFor) scheduledFor = new Date(data.scheduledFor);
  else if (existing?.scheduledFor) scheduledFor = existing.scheduledFor;

  let publishedAt: Date | null = existing?.publishedAt ?? null;
  if (status === "published") publishedAt = publishedAt || new Date();
  else if (status === "draft") publishedAt = null;
  else if (status === "scheduled") publishedAt = null;

  return {
    title,
    slug,
    excerpt: data.excerpt === undefined ? existing?.excerpt ?? null : data.excerpt,
    body: plain.slice(0, 100000),
    bodyHtml,
    featuredImageUrl:
      data.featuredImageUrl === undefined ? existing?.featuredImageUrl ?? null : data.featuredImageUrl,
    featuredImageAlt:
      data.featuredImageAlt === undefined ? existing?.featuredImageAlt ?? null : data.featuredImageAlt,
    categoryId: data.categoryId === undefined ? existing?.categoryId ?? null : data.categoryId,
    status,
    seoTitle: data.seoTitle === undefined ? existing?.seoTitle ?? null : data.seoTitle,
    seoDescription: data.seoDescription === undefined ? existing?.seoDescription ?? null : data.seoDescription,
    canonicalUrl: data.canonicalUrl === undefined ? existing?.canonicalUrl ?? null : data.canonicalUrl,
    ogImageUrl: data.ogImageUrl === undefined ? existing?.ogImageUrl ?? null : data.ogImageUrl,
    authorName: data.authorName === undefined ? existing?.authorName || "Zain Saeed" : data.authorName || "Zain Saeed",
    authorBio: data.authorBio === undefined ? existing?.authorBio ?? null : data.authorBio,
    readingMinutes: estimateReadingMinutes(bodyHtml),
    scheduledFor: status === "scheduled" ? scheduledFor : null,
    publishedAt,
  };
}

export async function recordSlugRedirect(fromSlug: string, toSlug: string) {
  if (!fromSlug || !toSlug || fromSlug === toSlug) return;
  const db = getDb();
  await db.delete(blogSlugRedirects).where(eq(blogSlugRedirects.fromSlug, fromSlug));
  await db.insert(blogSlugRedirects).values({ fromSlug, toSlug });
}
