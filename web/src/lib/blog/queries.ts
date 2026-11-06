import { and, asc, desc, eq, ilike, lte, or, sql } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import {
  blogCategories,
  blogPostRevisions,
  blogPosts,
  blogPostTags,
  blogSlugRedirects,
  blogTags,
} from "@/db/schema";

export async function promoteDueScheduledPosts() {
  await ensureSchema();
  const db = getDb();
  const now = new Date();
  await db
    .update(blogPosts)
    .set({ status: "published", publishedAt: now, updatedAt: now })
    .where(and(eq(blogPosts.status, "scheduled"), lte(blogPosts.scheduledFor, now)));
}

function liveStatusFilter() {
  const now = new Date();
  return or(
    eq(blogPosts.status, "published"),
    and(eq(blogPosts.status, "scheduled"), lte(blogPosts.scheduledFor, now)),
  );
}

export async function listPublishedPosts(opts?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  q?: string;
}) {
  await promoteDueScheduledPosts();
  const db = getDb();
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  let categoryId: number | null = null;
  if (opts?.categorySlug) {
    const [cat] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, opts.categorySlug))
      .limit(1);
    if (!cat) return { posts: [], total: 0, category: null };
    categoryId = cat.id;
  }

  const filters = [liveStatusFilter()];
  if (categoryId != null) filters.push(eq(blogPosts.categoryId, categoryId));
  if (opts?.q?.trim()) {
    const q = `%${opts.q.trim()}%`;
    filters.push(or(ilike(blogPosts.title, q), ilike(blogPosts.excerpt, q))!);
  }

  const where = and(...filters);
  const posts = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      featuredImageUrl: blogPosts.featuredImageUrl,
      featuredImageAlt: blogPosts.featuredImageAlt,
      readingMinutes: blogPosts.readingMinutes,
      publishedAt: blogPosts.publishedAt,
      authorName: blogPosts.authorName,
      categoryId: blogPosts.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(where)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
    .limit(limit)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(where);

  const category =
    opts?.categorySlug != null
      ? (
          await db.select().from(blogCategories).where(eq(blogCategories.slug, opts.categorySlug)).limit(1)
        )[0] || null
      : null;

  return { posts, total: Number(total) || 0, category };
}

export async function getPublishedPostBySlug(slug: string) {
  await promoteDueScheduledPosts();
  const db = getDb();
  const [post] = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      body: blogPosts.body,
      bodyHtml: blogPosts.bodyHtml,
      featuredImageUrl: blogPosts.featuredImageUrl,
      featuredImageAlt: blogPosts.featuredImageAlt,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      canonicalUrl: blogPosts.canonicalUrl,
      ogImageUrl: blogPosts.ogImageUrl,
      authorName: blogPosts.authorName,
      authorBio: blogPosts.authorBio,
      readingMinutes: blogPosts.readingMinutes,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      categoryId: blogPosts.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      status: blogPosts.status,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(and(eq(blogPosts.slug, slug), liveStatusFilter()))
    .limit(1);

  if (post) return { post, redirectedFrom: null as string | null };

  const [redir] = await db
    .select()
    .from(blogSlugRedirects)
    .where(eq(blogSlugRedirects.fromSlug, slug))
    .limit(1);
  if (!redir) return { post: null, redirectedFrom: null };

  const [target] = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      body: blogPosts.body,
      bodyHtml: blogPosts.bodyHtml,
      featuredImageUrl: blogPosts.featuredImageUrl,
      featuredImageAlt: blogPosts.featuredImageAlt,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      canonicalUrl: blogPosts.canonicalUrl,
      ogImageUrl: blogPosts.ogImageUrl,
      authorName: blogPosts.authorName,
      authorBio: blogPosts.authorBio,
      readingMinutes: blogPosts.readingMinutes,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      categoryId: blogPosts.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      status: blogPosts.status,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(and(eq(blogPosts.slug, redir.toSlug), liveStatusFilter()))
    .limit(1);

  return { post: target || null, redirectedFrom: slug };
}

export async function listRelatedPosts(postId: number, categoryId: number | null, limit = 3) {
  await ensureSchema();
  const db = getDb();
  const filters = [liveStatusFilter(), sql`${blogPosts.id} <> ${postId}`];
  if (categoryId != null) filters.push(eq(blogPosts.categoryId, categoryId));
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      featuredImageUrl: blogPosts.featuredImageUrl,
      readingMinutes: blogPosts.readingMinutes,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(...filters))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function listBlogCategories() {
  await ensureSchema();
  return getDb().select().from(blogCategories).orderBy(asc(blogCategories.name));
}

export async function listBlogTags() {
  await ensureSchema();
  return getDb().select().from(blogTags).orderBy(asc(blogTags.name));
}

export async function getPostTagNames(postId: number) {
  const db = getDb();
  const rows = await db
    .select({ name: blogTags.name, slug: blogTags.slug })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPostTags.postId, postId));
  return rows;
}

export async function listRevisions(postId: number) {
  await ensureSchema();
  return getDb()
    .select()
    .from(blogPostRevisions)
    .where(eq(blogPostRevisions.postId, postId))
    .orderBy(desc(blogPostRevisions.version))
    .limit(30);
}
