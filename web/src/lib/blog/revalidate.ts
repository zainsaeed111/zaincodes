import { revalidatePath } from "next/cache";

/** Invalidate public blog surfaces after CMS mutations (no redeploy required). */
export function revalidateBlogSurfaces(slug?: string | null, categorySlug?: string | null) {
  try {
    revalidatePath("/blog");
    revalidatePath("/blog/rss.xml");
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/blog");
    if (slug) {
      revalidatePath(`/blog/${slug}`);
      revalidatePath(`/api/blog/${slug}`);
    }
    if (categorySlug) revalidatePath(`/blog/category/${categorySlug}`);
  } catch {
    // revalidatePath can throw outside a request context (scripts/tests) — ignore.
  }
}
