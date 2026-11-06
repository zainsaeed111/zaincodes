"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { adminFetch } from "@/lib/admin-client";
import { runBlogSeoChecklist, type SeoWarning } from "@/lib/blog/seo-check";
import { slugify } from "@/lib/blog/sanitize";

type Category = { id: number; slug: string; name: string };
type PostListItem = {
  id: number;
  slug: string;
  title: string;
  status: string;
  updatedAt?: string;
  publishedAt?: string | null;
  categoryName?: string | null;
  contentVersion?: number;
};

type Draft = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categoryId: number | null;
  status: "draft" | "published" | "scheduled";
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  authorName: string;
  scheduledFor: string;
  tagNames: string;
  contentVersion: number;
};

const emptyDraft = (): Draft => ({
  title: "",
  slug: "",
  excerpt: "",
  bodyHtml: "",
  featuredImageUrl: "",
  featuredImageAlt: "",
  categoryId: null,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImageUrl: "",
  authorName: "Zain Saeed",
  scheduledFor: "",
  tagNames: "",
  contentVersion: 1,
});

export function BlogAdminPanel() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [seo, setSeo] = useState<SeoWarning[]>([]);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const autosaveTimer = useRef<number | null>(null);
  const draftRef = useRef<Draft | null>(null);
  draftRef.current = draft;

  const refreshList = useCallback(async () => {
    const { res, data } = await adminFetch("/api/admin/blog");
    if (res.ok) {
      setPosts(data.posts || []);
      setCategories(data.categories || []);
    }
  }, []);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (!draft) return;
    setSeo(
      runBlogSeoChecklist({
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        bodyHtml: draft.bodyHtml,
        featuredImageUrl: draft.featuredImageUrl,
        featuredImageAlt: draft.featuredImageAlt,
        canonicalUrl: draft.canonicalUrl,
      }),
    );
  }, [draft]);

  async function openPost(id: number) {
    setBusy(true);
    const { res, data } = await adminFetch(`/api/admin/blog/${id}`);
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error?.message || "Could not load post");
      return;
    }
    const p = data.post;
    setDraft({
      id: p.id,
      title: p.title || "",
      slug: p.slug || "",
      excerpt: p.excerpt || "",
      bodyHtml: p.bodyHtml || p.body || "",
      featuredImageUrl: p.featuredImageUrl || "",
      featuredImageAlt: p.featuredImageAlt || "",
      categoryId: p.categoryId ?? null,
      status: p.status || "draft",
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || "",
      canonicalUrl: p.canonicalUrl || "",
      ogImageUrl: p.ogImageUrl || "",
      authorName: p.authorName || "Zain Saeed",
      scheduledFor: p.scheduledFor ? new Date(p.scheduledFor).toISOString().slice(0, 16) : "",
      tagNames: (data.tags || []).map((t: { name: string }) => t.name).join(", "),
      contentVersion: p.contentVersion || 1,
    });
    setRevisions(data.revisions || []);
    setSeo(data.seo || []);
    setSaveState("idle");
    setNotice("");
  }

  function payloadFromDraft(d: Draft, autosave = false) {
    return {
      title: d.title,
      slug: d.slug || slugify(d.title),
      excerpt: d.excerpt || null,
      bodyHtml: d.bodyHtml,
      featuredImageUrl: d.featuredImageUrl || null,
      featuredImageAlt: d.featuredImageAlt || null,
      categoryId: d.categoryId,
      status: d.status,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      canonicalUrl: d.canonicalUrl || null,
      ogImageUrl: d.ogImageUrl || d.featuredImageUrl || null,
      authorName: d.authorName || "Zain Saeed",
      scheduledFor: d.status === "scheduled" && d.scheduledFor ? new Date(d.scheduledFor).toISOString() : null,
      tagNames: d.tagNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      expectedVersion: d.id ? d.contentVersion : undefined,
      autosave,
    };
  }

  async function save(opts?: { autosave?: boolean; publish?: boolean }) {
    const d = draftRef.current;
    if (!d || !d.title.trim()) return;
    const autosave = Boolean(opts?.autosave);
    setSaveState("saving");
    if (!autosave) setBusy(true);
    const body = payloadFromDraft(
      opts?.publish ? { ...d, status: d.status === "scheduled" ? "scheduled" : "published" } : d,
      autosave,
    );
    const { res, data } = await adminFetch(d.id ? `/api/admin/blog/${d.id}` : "/api/admin/blog", {
      method: d.id ? "PATCH" : "POST",
      body: JSON.stringify(body),
    });
    if (!autosave) setBusy(false);
    if (!res.ok) {
      setSaveState("error");
      setNotice(data.error?.message || "Save failed");
      if (data.error?.details?.post) {
        // version conflict — keep message
      }
      return;
    }
    const p = data.post;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            id: p.id,
            slug: p.slug,
            contentVersion: p.contentVersion,
            status: p.status,
          }
        : prev,
    );
    setSeo(data.seo || []);
    setSaveState("saved");
    setNotice(autosave ? "" : "Post saved.");
    await refreshList();
    if (!autosave && d.id) {
      const detail = await adminFetch(`/api/admin/blog/${p.id}`);
      if (detail.res.ok) setRevisions(detail.data.revisions || []);
    }
  }

  useEffect(() => {
    if (!draft?.id || !draft.title) return;
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      void save({ autosave: true });
    }, 8000);
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.title, draft?.bodyHtml, draft?.excerpt, draft?.slug, draft?.status]);

  async function uploadFeatured(file: File) {
    const body = new FormData();
    body.append("kind", "blog");
    body.append("file", file);
    setBusy(true);
    const { res, data } = await adminFetch("/api/admin/uploads", { method: "POST", body });
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error?.message || "Upload failed");
      return;
    }
    setDraft((d) => (d ? { ...d, featuredImageUrl: data.uploaded.url } : d));
    setNotice("Featured image uploaded.");
  }

  async function duplicate(id: number) {
    setBusy(true);
    const { res, data } = await adminFetch(`/api/admin/blog/${id}/duplicate`, { method: "POST", body: "{}" });
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error?.message || "Duplicate failed");
      return;
    }
    await refreshList();
    await openPost(data.post.id);
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`Delete “${title}”?`)) return;
    setBusy(true);
    const { res, data } = await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error?.message || "Delete failed");
      return;
    }
    if (draft?.id === id) setDraft(null);
    setNotice("Post deleted.");
    await refreshList();
  }

  async function restore(revisionId: number) {
    if (!draft?.id) return;
    if (!window.confirm("Restore this revision? Current content will be saved as a revision first.")) return;
    setBusy(true);
    const { res, data } = await adminFetch(`/api/admin/blog/${draft.id}/revisions/${revisionId}/restore`, {
      method: "POST",
      body: "{}",
    });
    setBusy(false);
    if (!res.ok) {
      setNotice(data.error?.message || "Restore failed");
      return;
    }
    await openPost(draft.id);
    setNotice("Revision restored.");
  }

  const filtered = posts.filter((p) => (filter === "all" ? true : p.status === filter));

  return (
    <div className="blog-admin">
      {notice ? <div className="notice" style={{ marginBottom: "1rem" }}>{notice}</div> : null}

      {!draft ? (
        <div>
          <div className="admin-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Blog posts ({posts.length})</h2>
              <p className="muted small">Paste from ChatGPT, preview, publish. Autosave keeps drafts safe.</p>
            </div>
            <button className="btn" type="button" onClick={() => setDraft(emptyDraft())}>
              New article
            </button>
          </div>
          <div className="work-filters" style={{ marginBottom: "1rem" }}>
            {["all", "draft", "published", "scheduled"].map((f) => (
              <button key={f} type="button" className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          {filtered.map((p) => (
            <div key={p.id} className="admin-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
              <div>
                <strong>{p.title}</strong>
                <div className="muted small">
                  {p.status} · {p.slug} · {p.categoryName || "uncategorized"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => openPost(p.id)}>
                  Edit
                </button>
                <button className="btn btn-secondary btn-sm" type="button" disabled={busy} onClick={() => duplicate(p.id)}>
                  Duplicate
                </button>
                {p.status === "published" ? (
                  <Link className="btn btn-secondary btn-sm" href={`/blog/${p.slug}`} target="_blank">
                    View
                  </Link>
                ) : (
                  <Link className="btn btn-secondary btn-sm" href={`/blog/preview/${p.id}`} target="_blank">
                    Preview
                  </Link>
                )}
                <button className="btn btn-danger btn-sm" type="button" disabled={busy} onClick={() => remove(p.id, p.title)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="blog-admin-editor-grid">
          <form
            className="admin-card form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{draft.id ? "Edit article" : "New article"}</h2>
              <div className="muted small">
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save error" : "Ready"}
                {draft.id ? ` · v${draft.contentVersion}` : ""}
              </div>
            </div>
            <label>
              Title
              <input
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          title,
                          slug: d.id ? d.slug : slugify(title),
                        }
                      : d,
                  );
                }}
                required
              />
            </label>
            <label>
              Slug
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} required />
            </label>
            <label>
              Excerpt
              <textarea rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            </label>
            <label>
              Body
              <BlogEditor value={draft.bodyHtml} onChange={(html) => setDraft((d) => (d ? { ...d, bodyHtml: html } : d))} disabled={busy} />
            </label>
            <div className="admin-media-block">
              <h4>Featured image</h4>
              {draft.featuredImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.featuredImageUrl} alt={draft.featuredImageAlt || ""} style={{ maxWidth: 320, borderRadius: 10 }} />
              ) : null}
              <div className="admin-media-row">
                <label className="btn btn-secondary btn-sm admin-file-btn">
                  Upload
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadFeatured(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <input
                  value={draft.featuredImageUrl}
                  onChange={(e) => setDraft({ ...draft, featuredImageUrl: e.target.value })}
                  placeholder="Or image URL"
                />
              </div>
              <input
                value={draft.featuredImageAlt}
                onChange={(e) => setDraft({ ...draft, featuredImageAlt: e.target.value })}
                placeholder="Alt text"
              />
            </div>
            <label>
              Category
              <select
                value={draft.categoryId ?? ""}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tags (comma)
              <input value={draft.tagNames} onChange={(e) => setDraft({ ...draft, tagNames: e.target.value })} />
            </label>
            <label>
              Status
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="scheduled">scheduled</option>
              </select>
            </label>
            {draft.status === "scheduled" ? (
              <label>
                Schedule for
                <input
                  type="datetime-local"
                  value={draft.scheduledFor}
                  onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })}
                />
              </label>
            ) : null}
            <label>
              SEO title
              <input value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} />
            </label>
            <label>
              Meta description
              <textarea rows={2} value={draft.seoDescription} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} />
            </label>
            <label>
              Canonical URL (optional)
              <input value={draft.canonicalUrl} onChange={(e) => setDraft({ ...draft, canonicalUrl: e.target.value })} />
            </label>
            <label>
              Author
              <input value={draft.authorName} onChange={(e) => setDraft({ ...draft, authorName: e.target.value })} />
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              <button className="btn" disabled={busy}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={busy}
                onClick={() => void save({ publish: true })}
              >
                {draft.status === "scheduled" ? "Save schedule" : "Save & publish"}
              </button>
              {draft.status === "published" || draft.status === "scheduled" ? (
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const next = { ...draft, status: "draft" as const, scheduledFor: "" };
                    draftRef.current = next;
                    setDraft(next);
                    void save();
                  }}
                >
                  Unpublish
                </button>
              ) : null}
              {draft.id ? (
                <Link className="btn btn-secondary" href={`/blog/preview/${draft.id}`} target="_blank">
                  Preview
                </Link>
              ) : null}
              <button className="btn btn-secondary" type="button" onClick={() => setDraft(null)}>
                Back to list
              </button>
            </div>
          </form>

          <aside className="admin-card blog-seo-panel">
            <h3 style={{ marginTop: 0 }}>SEO checklist</h3>
            <p className="muted small">Warnings only — not a ranking score.</p>
            <ul className="blog-seo-list">
              {seo.map((w) => (
                <li key={w.id} data-severity={w.severity}>
                  <strong>{w.severity}</strong> — {w.message}
                </li>
              ))}
            </ul>
            {draft.id && revisions.length ? (
              <>
                <h3>Revisions</h3>
                <ul className="blog-seo-list">
                  {revisions.map((r) => (
                    <li key={r.id}>
                      v{r.version} · {new Date(r.createdAt).toLocaleString()}
                      <button type="button" className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => restore(r.id)}>
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
