import { listPublishedPosts } from "@/lib/blog/queries";
import { apiOk, handleRouteError } from "@/lib/http";

export async function GET() {
  try {
    const { posts, total } = await listPublishedPosts({ limit: 100 });
    return apiOk({
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        featuredImageUrl: p.featuredImageUrl,
        publishedAt: p.publishedAt,
        categorySlug: p.categorySlug,
        readingMinutes: p.readingMinutes,
      })),
      count: total,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
