import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ensureSchema, getDb } from "@/db/client";
import {
  blogCategories,
  blogPostRevisions,
  blogPosts,
  blogPostTags,
  blogTags,
} from "@/db/schema";
import {
  isSlugTaken,
  normalizePostPayload,
  recordSlugRedirect,
  saveRevision,
  syncPostTags,
} from "@/lib/blog/admin";
import { revalidateBlogSurfaces } from "@/lib/blog/revalidate";
import { runBlogSeoChecklist } from "@/lib/blog/seo-check";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiError, apiOk, fromZodError, handleRouteError } from "@/lib/http";
import { log } from "@/lib/log";

const patchSchema = z.object({
  slug: z.string().min(1).max(160).optional(),
  title: z.string().min(1).max(240).optional(),
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
  expectedVersion: z.number().int().optional(),
  autosave: z.boolean().optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid id.");
    await ensureSchema();
    const db = getDb();
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!post) return apiError("NOT_FOUND", "Post not found.");
    const tags = await db
      .select({ name: blogTags.name, slug: blogTags.slug })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, id));
    const revisions = await db
      .select()
      .from(blogPostRevisions)
      .where(eq(blogPostRevisions.postId, id))
      .orderBy(desc(blogPostRevisions.version))
      .limit(30);
    const categories = await db.select().from(blogCategories);
    const seo = runBlogSeoChecklist({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      bodyHtml: post.bodyHtml || post.body,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
      canonicalUrl: post.canonicalUrl,
      slugTaken: false,
    });
    return apiOk({ post, tags, revisions, categories, seo });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid id.");
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing) return apiError("NOT_FOUND", "Post not found.");

    if (
      parsed.data.expectedVersion != null &&
      parsed.data.expectedVersion !== existing.contentVersion
    ) {
      return apiError(
        "CONFLICT",
        "This post was updated elsewhere. Reload the latest version or overwrite carefully.",
        { currentVersion: existing.contentVersion, post: existing },
      );
    }

    const normalized = normalizePostPayload(parsed.data, existing);
    if (!normalized.title || !normalized.slug) {
      return apiError("VALIDATION_ERROR", "Title and slug are required.");
    }
    if (await isSlugTaken(normalized.slug, id)) {
      return apiError("CONFLICT", "Slug already exists.");
    }
    if (normalized.status === "scheduled" && !normalized.scheduledFor) {
      return apiError("VALIDATION_ERROR", "scheduledFor is required for scheduled posts.");
    }

    if (existing.slug !== normalized.slug) {
      await recordSlugRedirect(existing.slug, normalized.slug);
    }

    const nextVersion = existing.contentVersion + 1;
    const [post] = await db
      .update(blogPosts)
      .set({
        ...normalized,
        contentVersion: nextVersion,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();

    if (parsed.data.tagNames) await syncPostTags(id, parsed.data.tagNames);
    if (!parsed.data.autosave) await saveRevision(post);

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

    revalidateBlogSurfaces(post.slug, undefined);
    if (existing.slug !== post.slug) revalidateBlogSurfaces(existing.slug);
    log.info("blog", "post updated", {
      id: post.id,
      status: post.status,
      slug: post.slug,
      autosave: Boolean(parsed.data.autosave),
    });
    return apiOk({ post, seo });
  } catch (err) {
    log.error("blog", "update failed", { message: err instanceof Error ? err.message : "unknown" });
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;
    const id = Number((await context.params).id);
    if (!Number.isFinite(id)) return apiError("BAD_REQUEST", "Invalid id.");
    await ensureSchema();
    const db = getDb();
    const deleted = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    if (!deleted.length) return apiError("NOT_FOUND", "Post not found.");
    revalidateBlogSurfaces(deleted[0].slug);
    log.info("blog", "post deleted", { id, slug: deleted[0].slug });
    return apiOk({ deleted: true });
  } catch (err) {
    log.error("blog", "delete failed", { message: err instanceof Error ? err.message : "unknown" });
    return handleRouteError(err);
  }
}
