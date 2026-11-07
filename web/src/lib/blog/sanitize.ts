/**
 * Workers-safe HTML sanitizer (no jsdom / isomorphic-dompurify).
 * Strips scripts, event handlers, and javascript: URLs while keeping editorial tags.
 */

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
]);

const ALLOWED_ATTR = new Set([
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "width",
  "height",
  "colspan",
  "rowspan",
]);

function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const attrs: string[] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawAttrs))) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    if (!ALLOWED_ATTR.has(name)) continue;
    if (name.startsWith("on")) continue;
    if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) continue;
    if (name === "href" || name === "src") {
      const safe = value.replace(/"/g, "&quot;");
      attrs.push(`${name}="${safe}"`);
      if (name === "href" && /target=/i.test(rawAttrs)) {
        // keep target/rel handled below
      }
      continue;
    }
    attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "a") {
    if (!attrs.some((a) => a.startsWith("rel="))) attrs.push('rel="noopener noreferrer"');
  }
  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

export function sanitizeBlogHtml(dirty: string | null | undefined): string {
  const input = String(dirty || "").trim();
  if (!input) return "";

  let html = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, tagName: string, rawAttrs = "") => {
    const tag = tagName.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;
    if (tag === "br" || tag === "hr") return `<${tag}>`;
    return `<${tag}${sanitizeAttributes(tag, rawAttrs || "")}>`;
  });

  return html;
}

export function htmlToPlainText(html: string): string {
  return sanitizeBlogHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadingMinutes(html: string): number {
  const words = htmlToPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function extractHeadings(html: string): Array<{ id: string; text: string; level: number }> {
  const clean = sanitizeBlogHtml(html);
  const matches = [...clean.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m, i) => {
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    const id = `h-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section"}`;
    return { id, text, level: Number(m[1]) };
  });
}

/** Add id attributes to h2/h3 for TOC anchors. */
export function injectHeadingIds(html: string): string {
  let i = 0;
  return sanitizeBlogHtml(html).replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (_full, level, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    const id = `h-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section"}`;
    i += 1;
    if (/\sid=/.test(attrs)) return `<h${level}${attrs}>${inner}</h${level}>`;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}
