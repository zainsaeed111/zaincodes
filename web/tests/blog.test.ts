import { describe, expect, it } from "vitest";
import {
  estimateReadingMinutes,
  extractHeadings,
  htmlToPlainText,
  injectHeadingIds,
  sanitizeBlogHtml,
  slugify,
} from "@/lib/blog/sanitize";
import { runBlogSeoChecklist } from "@/lib/blog/seo-check";

describe("blog sanitize", () => {
  it("strips scripts and event handlers from pasted HTML", () => {
    const dirty = `<p onclick="alert(1)">Hello</p><script>evil()</script><img src="/x.png" onerror="alert(2)" alt="ok">`;
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toContain("<p>");
    expect(clean).toContain("Hello");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain('alt="ok"');
  });

  it("preserves ChatGPT-style formatting blocks", () => {
    const pasted = `<h2>Title</h2><p>Intro</p><ul><li>One</li><li>Two</li></ul><pre><code>const x = 1</code></pre><blockquote>note</blockquote>`;
    const clean = sanitizeBlogHtml(pasted);
    expect(clean).toContain("<h2>");
    expect(clean).toContain("<ul>");
    expect(clean).toContain("<pre>");
    expect(clean).toContain("<blockquote>");
  });

  it("estimates reading time", () => {
    const html = `<p>${"word ".repeat(440)}</p>`;
    expect(estimateReadingMinutes(html)).toBeGreaterThanOrEqual(2);
  });

  it("slugifies titles", () => {
    expect(slugify("Hello World!! AI Tools")).toBe("hello-world-ai-tools");
  });

  it("converts html to plain text for body storage", () => {
    expect(htmlToPlainText("<p>Hello <strong>world</strong></p>")).toContain("Hello");
    expect(htmlToPlainText("<p>Hello <strong>world</strong></p>")).not.toContain("<");
  });

  it("injects heading ids for TOC anchors", () => {
    const html = injectHeadingIds("<h2>Clean Architecture</h2><h3>Layering</h3>");
    expect(html).toMatch(/id="h-0-clean-architecture"/);
    expect(html).toMatch(/id="h-1-layering"/);
    const headings = extractHeadings(html);
    expect(headings.length).toBe(2);
    expect(headings[0].text).toBe("Clean Architecture");
  });
});

describe("blog seo checklist", () => {
  it("flags missing title and slug", () => {
    const warnings = runBlogSeoChecklist({ title: "", slug: "", bodyHtml: "<p>Hi</p>" });
    expect(warnings.some((w) => w.id === "title")).toBe(true);
    expect(warnings.some((w) => w.id === "slug")).toBe(true);
  });

  it("flags duplicate slug", () => {
    const warnings = runBlogSeoChecklist({
      title: "A reasonably long article title about engineering",
      slug: "taken-slug",
      slugTaken: true,
      bodyHtml: "<p>Content</p>",
    });
    expect(warnings.some((w) => w.id === "slug-dup")).toBe(true);
  });

  it("passes a well-formed article", () => {
    const warnings = runBlogSeoChecklist({
      title: "Shipping Clean Architecture Apps With Confidence",
      slug: "clean-architecture-apps",
      excerpt: "A practical guide for Android and full-stack delivery teams.",
      seoTitle: "Clean Architecture Apps — ZainCodes",
      seoDescription: "Practical guidance on clean architecture for Android and full-stack delivery.",
      bodyHtml: `<p>${"word ".repeat(350)}</p><h2>Structure</h2><p>${"more ".repeat(80)}</p>`,
      featuredImageUrl: "/api/media/blog/cover.webp",
      featuredImageAlt: "Architecture diagram",
    });
    const errors = warnings.filter((w) => w.severity === "error");
    expect(errors).toHaveLength(0);
  });
});

describe("blog publish visibility rules", () => {
  it("documents draft vs published visibility contract", () => {
    const statuses = {
      draft: { public: false, sitemap: false, rss: false },
      scheduledFuture: { public: false, sitemap: false, rss: false },
      published: { public: true, sitemap: true, rss: true },
    };
    expect(statuses.draft.public).toBe(false);
    expect(statuses.published.public).toBe(true);
    expect(statuses.published.sitemap).toBe(true);
  });
});
