import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import { blogCategories, blogPosts, projects } from "@/db/schema";
import { SERVICE_PAGES } from "@/lib/services-content";
import { promoteDueScheduledPosts } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const staticRoutes = ["", "/projects", "/blog", "/blog/rss.xml"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = SERVICE_PAGES.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  let projectRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    await ensureSchema();
    await promoteDueScheduledPosts();
    const db = getDb();
    const publishedProjects = await db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(eq(projects.status, "published"));
    projectRoutes = publishedProjects.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: p.updatedAt,
    }));
    const posts = await db
      .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));
    blogRoutes = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
    }));
    const cats = await db.select({ slug: blogCategories.slug }).from(blogCategories);
    categoryRoutes = cats.map((c) => ({
      url: `${base}/blog/category/${c.slug}`,
      lastModified: new Date(),
    }));
  } catch {
    // ignore during build without DB
  }

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...blogRoutes, ...categoryRoutes];
}
