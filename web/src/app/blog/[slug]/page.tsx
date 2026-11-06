import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getPostTagNames,
  getPublishedPostBySlug,
  listRelatedPosts,
} from "@/lib/blog/queries";
import { extractHeadings, injectHeadingIds } from "@/lib/blog/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { post, redirectedFrom } = await getPublishedPostBySlug(slug);
  if (redirectedFrom && post) {
    return { alternates: { canonical: `/blog/${post.slug}` } };
  }
  if (!post) return { title: "Article" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      images: post.ogImageUrl || post.featuredImageUrl ? [post.ogImageUrl || post.featuredImageUrl!] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, redirectedFrom } = await getPublishedPostBySlug(slug);
  if (redirectedFrom && post) redirect(`/blog/${post.slug}`);
  if (!post) notFound();

  const html = injectHeadingIds(post.bodyHtml || post.body || "");
  const headings = extractHeadings(html);
  const related = await listRelatedPosts(post.id, post.categoryId, 3);
  const tags = await getPostTagNames(post.id);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.ogImageUrl || post.featuredImageUrl || undefined,
    author: { "@type": "Person", name: post.authorName || "Zain Saeed" },
    mainEntityOfPage: `${site}/blog/${post.slug}`,
  };

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${site}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${site}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <main className="section blog-article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      <article className="container blog-article">
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          {post.categorySlug ? (
            <>
              <span>/</span>
              <Link href={`/blog/category/${post.categorySlug}`}>{post.categoryName}</Link>
            </>
          ) : null}
        </nav>

        <header className="blog-article-head">
          <p className="blog-meta">
            {post.categoryName || "Article"} · {post.readingMinutes || 1} min read
            {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString()}` : ""}
          </p>
          <h1>{post.title}</h1>
          <p className="blog-author">By {post.authorName || "Zain Saeed"}</p>
          {post.excerpt ? <p className="blog-deck">{post.excerpt}</p> : null}
        </header>

        {post.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="blog-article-cover"
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
          />
        ) : null}

        <div className="blog-article-layout">
          {headings.length > 2 ? (
            <aside className="blog-toc">
              <p>On this page</p>
              <ul>
                {headings.map((h) => (
                  <li key={h.id} data-level={h.level}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <div />
          )}

          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <div className="blog-share">
          <a
            className="btn btn-secondary btn-sm"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${site}/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share
          </a>
          <Link className="btn btn-secondary btn-sm" href={`/blog/${post.slug}`}>
            Permalink /blog/{post.slug}
          </Link>
        </div>

        {tags.length ? (
          <div className="blog-tags">
            {tags.map((t) => (
              <span key={t.slug}>{t.name}</span>
            ))}
          </div>
        ) : null}

        <aside className="blog-cta">
          <h2>Need a product built?</h2>
          <p>ZainCodes ships web, full-stack, and mobile systems with clear architecture.</p>
          <Link className="btn" href="/#contact">
            Start a project
          </Link>
        </aside>

        {related.length ? (
          <section className="blog-related">
            <h2>Related articles</h2>
            <div className="blog-card-grid">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="blog-card">
                  <div className="blog-card-copy">
                    <span className="blog-meta">{r.readingMinutes || 1} min read</span>
                    <h3>{r.title}</h3>
                    <p>{r.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
