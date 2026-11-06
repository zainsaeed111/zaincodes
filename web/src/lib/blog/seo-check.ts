import { htmlToPlainText } from "./sanitize";

export type SeoWarning = {
  id: string;
  severity: "info" | "warn" | "error";
  message: string;
};

export function runBlogSeoChecklist(input: {
  title: string;
  slug: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  bodyHtml?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  canonicalUrl?: string | null;
  slugTaken?: boolean;
}): SeoWarning[] {
  const warnings: SeoWarning[] = [];
  const title = input.title?.trim() || "";
  const slug = input.slug?.trim() || "";
  const seoTitle = (input.seoTitle || title).trim();
  const seoDesc = (input.seoDescription || input.excerpt || "").trim();
  const html = input.bodyHtml || "";
  const plain = htmlToPlainText(html);
  const words = plain.split(/\s+/).filter(Boolean).length;

  if (!title) warnings.push({ id: "title", severity: "error", message: "Article title is required." });
  else if (title.length < 30)
    warnings.push({ id: "title-short", severity: "warn", message: "Title is short; aim for ~40–60 characters." });
  else if (title.length > 70)
    warnings.push({ id: "title-long", severity: "warn", message: "Title is long; search results may truncate it." });

  if (!slug) warnings.push({ id: "slug", severity: "error", message: "URL slug is required." });
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    warnings.push({ id: "slug-format", severity: "warn", message: "Slug should be lowercase kebab-case." });
  if (input.slugTaken)
    warnings.push({ id: "slug-dup", severity: "error", message: "This slug is already used by another post." });

  if (!seoTitle)
    warnings.push({ id: "seo-title", severity: "warn", message: "Add an SEO title (or rely on the article title)." });
  else if (seoTitle.length > 60)
    warnings.push({ id: "seo-title-long", severity: "warn", message: "SEO title exceeds ~60 characters." });

  if (!seoDesc)
    warnings.push({ id: "meta-desc", severity: "warn", message: "Add a meta description (~120–160 characters)." });
  else if (seoDesc.length < 70)
    warnings.push({ id: "meta-desc-short", severity: "info", message: "Meta description is short." });
  else if (seoDesc.length > 165)
    warnings.push({ id: "meta-desc-long", severity: "warn", message: "Meta description may be truncated in SERPs." });

  const h1 = (html.match(/<h1\b/gi) || []).length;
  const h2 = (html.match(/<h2\b/gi) || []).length;
  if (h1 > 1) warnings.push({ id: "h1-many", severity: "warn", message: "Multiple H1 tags in body — prefer one page H1." });
  if (words > 400 && h2 === 0)
    warnings.push({ id: "headings", severity: "warn", message: "Long article without H2 sections — add subheadings." });

  if (words < 300)
    warnings.push({ id: "length", severity: "info", message: `Body is ~${words} words; longer guides often cover a topic more fully.` });

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const missingAlt = imgs.filter((m) => !/\balt\s*=\s*["'][^"']+["']/i.test(m[0])).length;
  if (imgs.length && missingAlt)
    warnings.push({ id: "img-alt", severity: "warn", message: `${missingAlt} image(s) missing alt text.` });
  if (input.featuredImageUrl && !input.featuredImageAlt)
    warnings.push({ id: "cover-alt", severity: "warn", message: "Featured image is missing alt text." });

  const internal = (html.match(/href=["']\/[^"']+["']/gi) || []).length;
  if (words > 500 && internal === 0)
    warnings.push({ id: "internal-links", severity: "info", message: "No internal links yet — link to services or related posts." });

  if (input.canonicalUrl && !/^https?:\/\//i.test(input.canonicalUrl) && !input.canonicalUrl.startsWith("/"))
    warnings.push({ id: "canonical", severity: "warn", message: "Canonical URL should be absolute or site-relative." });

  if (!warnings.length)
    warnings.push({ id: "ok", severity: "info", message: "No major SEO issues detected. This is not a ranking guarantee." });

  return warnings;
}
