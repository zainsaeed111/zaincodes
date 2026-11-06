import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { getSessionFromCookies } from "@/lib/auth";
import { injectHeadingIds } from "@/lib/blog/sanitize";

export const dynamic = "force-dynamic";

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();
  await ensureSchema();
  const [post] = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!post) notFound();

  const html = injectHeadingIds(post.bodyHtml || post.body || "");

  return (
    <main className="section blog-article-page">
      <article className="container blog-article">
        <p className="notice" style={{ marginBottom: "1rem" }}>
          Preview — {post.status}. Not public unless published.{" "}
          <Link href="/admin">Back to admin</Link>
        </p>
        <h1>{post.title}</h1>
        {post.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="blog-article-cover" src={post.featuredImageUrl} alt={post.featuredImageAlt || post.title} />
        ) : null}
        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
