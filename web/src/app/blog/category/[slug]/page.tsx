import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPublishedPosts } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await listPublishedPosts({ categorySlug: slug, limit: 1 });
  if (!category) return { title: "Category" };
  return {
    title: `${category.name} — Blog`,
    description: `Articles in ${category.name} from ZainCodes.`,
    alternates: { canonical: `/blog/category/${slug}` },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { posts, category, total } = await listPublishedPosts({ categorySlug: slug, limit: 24 });
  if (!category) notFound();

  return (
    <main className="section blog-index">
      <div className="container">
        <nav className="blog-breadcrumbs">
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span>{category.name}</span>
        </nav>
        <div className="blog-index-head">
          <div>
            <p className="eyebrow">Category</p>
            <h1>{category.name}</h1>
            <p className="blog-lede">{total} article{total === 1 ? "" : "s"}</p>
          </div>
        </div>
        {!posts.length ? (
          <p className="muted">No published articles in this category yet.</p>
        ) : (
          <div className="blog-card-grid">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImageUrl || "/brand/zaincodes-icon-dark.svg"}
                    alt={post.featuredImageAlt || post.title}
                    loading="lazy"
                  />
                </div>
                <div className="blog-card-copy">
                  <span className="blog-meta">{post.readingMinutes || 1} min read</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
