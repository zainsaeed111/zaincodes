import Link from "next/link";
import type { Metadata } from "next";
import { listBlogCategories, listPublishedPosts } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — AI, Software Engineering & Modern Development",
  description:
    "Articles on AI tools, web and full-stack development, mobile engineering, and practical developer tutorials from ZainCodes.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const limit = 9;
  const { posts, total } = await listPublishedPosts({
    limit,
    offset: (page - 1) * limit,
    q: sp.q,
  });
  const categories = await listBlogCategories();
  const featured = !sp.q && page === 1 ? posts[0] : null;
  const rest = featured ? posts.slice(1) : posts;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="section blog-index">
      <div className="container">
        <div className="blog-index-head">
          <div>
            <p className="eyebrow">Blog</p>
            <h1>AI, software engineering & modern development</h1>
            <p className="blog-lede">
              Practical writing on shipping products — tools, architecture, and tutorials. No filler posts.
            </p>
          </div>
          <form className="blog-search" action="/blog" method="get">
            <input name="q" defaultValue={sp.q || ""} placeholder="Search articles" aria-label="Search articles" />
            <button className="btn btn-secondary btn-sm" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="blog-cats">
          <Link href="/blog" className={!sp.q ? "active" : ""}>
            All
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/blog/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>

        {!posts.length ? (
          <p className="muted">No published articles yet.</p>
        ) : (
          <>
            {featured ? (
              <Link href={`/blog/${featured.slug}`} className="blog-featured">
                <div className="blog-featured-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.featuredImageUrl || "/brand/zaincodes-icon-dark.svg"}
                    alt={featured.featuredImageAlt || featured.title}
                  />
                </div>
                <div className="blog-featured-copy">
                  <span className="blog-meta">
                    Featured · {featured.categoryName || "Article"} · {featured.readingMinutes || 1} min
                  </span>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                </div>
              </Link>
            ) : null}

            <div className="blog-card-grid">
              {rest.map((post) => (
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
                    <span className="blog-meta">
                      {post.categoryName || "Article"} · {post.readingMinutes || 1} min read
                    </span>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 ? (
              <nav className="blog-pager" aria-label="Pagination">
                {page > 1 ? (
                  <Link href={`/blog?page=${page - 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>Previous</Link>
                ) : (
                  <span />
                )}
                <span>
                  Page {page} / {pages}
                </span>
                {page < pages ? (
                  <Link href={`/blog?page=${page + 1}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}>Next</Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
