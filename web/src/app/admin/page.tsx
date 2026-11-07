"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { BlogAdminPanel } from "@/components/admin/BlogAdminPanel";
import { BlogSetupPanel } from "@/components/admin/BlogSetupPanel";
import { BlogTrafficPanel } from "@/components/admin/BlogTrafficPanel";
import { ProjectBanner } from "@/components/ProjectBanner";
import { adminFetch } from "@/lib/admin-client";
import {
  CATEGORY_PRESETS,
  canonicalizeTypeSlug,
  isPresetCategory,
  slugifyCategory,
} from "@/lib/project-taxonomy";

type Tab =
  | "hero"
  | "about"
  | "experience"
  | "skills"
  | "projects"
  | "services"
  | "blog"
  | "blog-traffic"
  | "blog-setup"
  | "resume"
  | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("admin@zaincodes.local");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("hero");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [content, setContent] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const projectFormRef = useRef<HTMLFormElement | null>(null);
  const [socialDraft, setSocialDraft] = useState<Array<{ name: string; url: string }>>([]);

  const refresh = useCallback(async () => {
    try {
      const me = await adminFetch("/api/auth/me");
      if (!me.res.ok || !me.data?.authenticated) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      await adminFetch("/api/auth/csrf");
      const c = await adminFetch("/api/admin/content");
      if (c.res.ok) {
        setContent(c.data.content);
        setSocialDraft(
          (c.data.content?.social || []).map((s: { name: string; url: string }) => ({
            name: s.name || "",
            url: s.url || "",
          })),
        );
      }
      const p = await adminFetch("/api/admin/projects");
      if (p.res.ok) setProjects(p.data.projects || []);
      const pt = await adminFetch("/api/admin/project-types");
      if (pt.res.ok) setProjectTypes(pt.data.types || []);
      const s = await adminFetch("/api/admin/services");
      if (s.res.ok) setServices(s.data.services || []);
      const b = await adminFetch("/api/admin/blog");
      if (b.res.ok) setPosts(b.data.posts || []);
    } catch (err) {
      console.error("admin refresh failed", err);
      setNotice(err instanceof Error ? err.message : "Admin refresh failed");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextEmail = String(fd.get("email") || email).trim();
    const nextPassword = String(fd.get("password") || password);
    setEmail(nextEmail);
    setPassword(nextPassword);
    setBusy(true);
    setNotice("");
    try {
      const { res, data } = await adminFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });
      if (!res.ok) {
        setNotice(data.error?.message || "Login failed");
        return;
      }
      await refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await adminFetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setContent(null);
  }

  async function saveHero(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { res, data } = await adminFetch("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({
        hero: {
          badge: fd.get("badge"),
          badgeEnabled: fd.get("badgeEnabled") === "on",
          greeting: fd.get("greeting"),
          title: fd.get("title"),
          description: fd.get("description"),
          avatarUrl: fd.get("avatarUrl"),
          statApps: Number(fd.get("statApps") || 0),
          statYears: Number(fd.get("statYears") || 0),
          statSatisfaction: Number(fd.get("statSatisfaction") || 0),
        },
      }),
    });
    setBusy(false);
    setNotice(res.ok ? "Hero saved — visible on public home." : data.error?.message || "Save failed");
    if (res.ok) setContent(data.content);
  }

  async function saveAbout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { res, data } = await adminFetch("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({
        about: {
          subtitle: fd.get("subtitle"),
          introTitle: fd.get("introTitle"),
          introText: fd.get("introText"),
          experienceSummary: fd.get("experienceSummary"),
          educationSummary: fd.get("educationSummary"),
        },
        contact: {
          email: fd.get("email"),
          phone: fd.get("phone"),
          location: fd.get("location"),
        },
        settings: {
          whatsappE164: String(fd.get("whatsappE164") || ""),
          footerBlurb: String(fd.get("footerBlurb") || ""),
          brandName: "ZainCodes",
        },
      }),
    });
    setBusy(false);
    setNotice(res.ok ? "About/contact/settings saved." : data.error?.message || "Save failed");
    if (res.ok) setContent(data.content);
  }

  function emptyToNull(v: FormDataEntryValue | null) {
    const s = String(v ?? "").trim();
    return s ? s : null;
  }

  function normalizeShotUrls(project: any): string[] {
    return (project?.screenshots || [])
      .map((s: any) => (typeof s === "string" ? s : s?.url || ""))
      .map((u: string) => u.trim())
      .filter(Boolean);
  }

  function openProjectEditor(project: any) {
    const shotUrls = normalizeShotUrls(project);
    const order = Array.isArray(project.showcaseImageOrder) ? project.showcaseImageOrder.filter(Boolean) : [];
    const typeSlugs = Array.isArray(project.typeSlugs) && project.typeSlugs.length
      ? project.typeSlugs.map((s: string) => canonicalizeTypeSlug(s) || slugifyCategory(s))
      : [canonicalizeTypeSlug(project.category) || "web-development"];
    const primary = typeSlugs[0] || "web-development";
    const preset = isPresetCategory(primary);
    setEditingProject({
      ...project,
      workContext: project.workContext || "unassigned",
      needsGroupReview: project.needsGroupReview ?? (project.workContext === "unassigned" ? 1 : 0),
      typeSlugs,
      category: primary,
      categorySelect: preset ? primary : "__custom",
      categoryCustomDraft: preset ? "" : primary,
      categoryIcon: project.categoryIcon || (preset ? CATEGORY_PRESETS.find((p) => p.id === primary)?.icon : "spark"),
      coverUrl: project.coverUrl || "",
      thumbnailUrl: project.thumbnailUrl || "",
      videoUrl: project.videoUrl || "",
      videoPosterUrl: project.videoPosterUrl || "",
      previewStyle: "banner",
      showcaseMode: project.showcaseMode || "static",
      showcaseAutoplay: project.showcaseAutoplay ?? 1,
      slideshowIntervalMs: project.slideshowIntervalMs ?? 4200,
      imageFit: project.imageFit || "cover",
      bannerAspect: project.bannerAspect || "16/10",
      scrollPreview: project.scrollPreview ?? 0,
      isFeatured: project.isFeatured ?? 0,
      sortOrder: project.sortOrder ?? 0,
      showcaseImageOrder: order.length ? order : shotUrls,
      shotUrls,
      shotUrlDraft: "",
      showListingPreview: true,
    });
    setNotice("");
    window.requestAnimationFrame(() => {
      projectFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function uploadProjectFile(file: File) {
    const body = new FormData();
    body.append("kind", "projects");
    body.append("file", file);
    const { res, data } = await adminFetch("/api/admin/uploads", { method: "POST", body });
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return String(data.uploaded?.url || "");
  }

  async function onCoverUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editingProject) return;
    setBusy(true);
    setNotice("");
    try {
      const url = await uploadProjectFile(file);
      setEditingProject({ ...editingProject, coverUrl: url });
      setNotice("Main banner uploaded — save project to publish.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Banner upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPosterUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editingProject) return;
    setBusy(true);
    setNotice("");
    try {
      const url = await uploadProjectFile(file);
      setEditingProject({ ...editingProject, videoPosterUrl: url });
      setNotice("Video poster uploaded — save project to publish.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Poster upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onScreenshotsUpload(files: FileList | null) {
    if (!files?.length || !editingProject) return;
    setBusy(true);
    setNotice("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadProjectFile(file));
      }
      const shotUrls = [...(editingProject.shotUrls || []), ...uploaded];
      const showcaseImageOrder = [...(editingProject.showcaseImageOrder || []), ...uploaded];
      setEditingProject({ ...editingProject, shotUrls, showcaseImageOrder });
      setNotice(`${uploaded.length} image(s) uploaded — save project to publish.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Screenshot upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVideoUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editingProject) return;
    setBusy(true);
    setNotice("");
    try {
      const url = await uploadProjectFile(file);
      setEditingProject({ ...editingProject, videoUrl: url, showcaseMode: "video" });
      setNotice("Video uploaded — display mode set to Video. Save to publish.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setBusy(false);
    }
  }

  function removeShot(url: string) {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      shotUrls: (editingProject.shotUrls || []).filter((u: string) => u !== url),
      showcaseImageOrder: (editingProject.showcaseImageOrder || []).filter((u: string) => u !== url),
    });
  }

  function moveShot(url: string, dir: -1 | 1) {
    if (!editingProject) return;
    const list = [...(editingProject.shotUrls || [])];
    const i = list.indexOf(url);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const order = [...(editingProject.showcaseImageOrder || [])];
    const oi = order.indexOf(url);
    if (oi >= 0) {
      const oj = oi + dir;
      if (oj >= 0 && oj < order.length) [order[oi], order[oj]] = [order[oj], order[oi]];
    }
    setEditingProject({ ...editingProject, shotUrls: list, showcaseImageOrder: order.length ? order : list });
  }

  function toggleVisibleShot(url: string) {
    if (!editingProject) return;
    const order: string[] = [...(editingProject.showcaseImageOrder || [])];
    const i = order.indexOf(url);
    if (i >= 0) order.splice(i, 1);
    else order.push(url);
    setEditingProject({ ...editingProject, showcaseImageOrder: order });
  }

  function setAsBanner(url: string) {
    if (!editingProject) return;
    setEditingProject({ ...editingProject, coverUrl: url });
  }

  function addShotUrl() {
    if (!editingProject) return;
    const next = String(editingProject.shotUrlDraft || "").trim();
    if (!next) return;
    if ((editingProject.shotUrls || []).includes(next)) {
      setEditingProject({ ...editingProject, shotUrlDraft: "" });
      return;
    }
    setEditingProject({
      ...editingProject,
      shotUrls: [...(editingProject.shotUrls || []), next],
      showcaseImageOrder: [...(editingProject.showcaseImageOrder || []), next],
      shotUrlDraft: "",
    });
  }

  async function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingProject) return;
    const fd = new FormData(e.currentTarget);
    const customSlug = slugifyCategory(String(editingProject.categoryCustomDraft || ""));
    const selectedTypes: string[] = Array.from(
      new Set(
        [
          ...(editingProject.typeSlugs || []),
          ...(editingProject.categorySelect === "__custom" && customSlug ? [customSlug] : []),
        ]
          .map((s: string) => canonicalizeTypeSlug(s) || slugifyCategory(s))
          .filter(Boolean),
      ),
    );
    if (!selectedTypes.length) {
      setNotice("Select at least one subcategory.");
      return;
    }
    const workContext = String(editingProject.workContext || fd.get("workContext") || "unassigned");
    const payload = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      category: selectedTypes[0],
      typeSlugs: selectedTypes,
      workContext,
      needsGroupReview: workContext === "unassigned" ? 1 : 0,
      categoryIcon: emptyToNull(editingProject.categoryIcon || fd.get("categoryIcon")),
      description: emptyToNull(fd.get("description")),
      longDescription: emptyToNull(fd.get("longDescription")),
      problem: emptyToNull(fd.get("problem")),
      solution: emptyToNull(fd.get("solution")),
      architecture: emptyToNull(fd.get("architecture")),
      technologies: String(fd.get("technologies") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      coverUrl: emptyToNull(editingProject.coverUrl),
      thumbnailUrl: emptyToNull(editingProject.thumbnailUrl || editingProject.coverUrl),
      videoUrl: emptyToNull(editingProject.videoUrl),
      videoPosterUrl: emptyToNull(editingProject.videoPosterUrl),
      previewStyle: "banner",
      showcaseMode: editingProject.showcaseMode || "static",
      showcaseAutoplay: Number(editingProject.showcaseAutoplay) === 1,
      slideshowIntervalMs: Number(editingProject.slideshowIntervalMs) || 4200,
      imageFit: editingProject.imageFit || "cover",
      bannerAspect: editingProject.bannerAspect || "16/10",
      scrollPreview: Number(editingProject.scrollPreview) === 1,
      showcaseImageOrder: (editingProject.showcaseImageOrder || []).filter(Boolean),
      isFeatured: Number(editingProject.isFeatured) === 1,
      sortOrder: Number(fd.get("sortOrder") ?? editingProject.sortOrder) || 0,
      githubLink: emptyToNull(fd.get("githubLink")),
      liveLink: emptyToNull(fd.get("liveLink")),
      playStoreLink: emptyToNull(fd.get("playStoreLink")),
      status: fd.get("status"),
      screenshots: (editingProject.shotUrls || []).filter(Boolean),
    };
    setBusy(true);
    const isNew = !editingProject.id;
    const { res, data } = await adminFetch(
      isNew ? "/api/admin/projects" : `/api/admin/projects/${editingProject.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      },
    );
    setBusy(false);
    setNotice(res.ok ? "Project saved." : data.error?.message || "Save failed");
    if (res.ok) {
      setEditingProject(null);
      await refresh();
    }
  }

  async function deleteProject(project: { id: number; title: string }) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const { res, data } = await adminFetch(`/api/admin/projects/${project.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    setNotice(res.ok ? `Deleted “${project.title}”.` : data.error?.message || "Delete failed");
    if (res.ok) {
      if (editingProject?.id === project.id) setEditingProject(null);
      await refresh();
    }
  }

  async function saveServices() {
    setBusy(true);
    const { res, data } = await adminFetch("/api/admin/services", {
      method: "PUT",
      body: JSON.stringify(services),
    });
    setBusy(false);
    setNotice(res.ok ? "Services saved." : data.error?.message || "Save failed");
    if (res.ok) setServices(data.services || []);
  }

  async function uploadResume(file: File) {
    const body = new FormData();
    body.append("kind", "resumes");
    body.append("file", file);
    setBusy(true);
    const { res, data } = await adminFetch("/api/admin/uploads", { method: "POST", body });
    setBusy(false);
    setNotice(res.ok ? "Resume uploaded and published." : data.error?.message || "Upload failed");
  }

  if (!authed) {
    return (
      <main className="page" style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1rem" }}>
        <h1>Admin login</h1>
        <p style={{ margin: "0.75rem 0 1.25rem" }}>Server session + CSRF. No GitHub tokens.</p>
        <form className="form-grid" onSubmit={login}>
          <label>
            Email
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            Sign in
          </button>
        </form>
        {notice ? <div className="notice error" style={{ marginTop: "1rem" }}>{notice}</div> : null}
        <p style={{ marginTop: "1rem" }}>
          <Link href="/">← Public site</Link>
        </p>
      </main>
    );
  }

  const hero = content?.hero || {};
  const about = content?.about || {};
  const contact = content?.contact || {};
  const settings = content?.settings || {};

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand" style={{ marginBottom: "1rem" }}>
          Zain<span>Codes</span> CMS
        </div>
        {(
          [
            ["hero", "Hero"],
            ["about", "About / Contact"],
            ["experience", "Experience / Education"],
            ["skills", "Skills"],
            ["projects", "Projects"],
            ["services", "Services"],
            ["blog", "Blog"],
            ["blog-traffic", "Blog traffic"],
            ["blog-setup", "Blog setup"],
            ["resume", "Resume"],
            ["settings", "Settings"],
          ] as Array<[Tab, string]>
        ).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
        <button type="button" onClick={logout} style={{ marginTop: "1rem" }}>
          Log out
        </button>
        <Link href="/" style={{ display: "block", marginTop: "0.75rem", color: "var(--muted)" }}>
          View site
        </Link>
      </aside>
      <main className="admin-main">
        {notice ? <div className="notice" style={{ marginBottom: "1rem" }}>{notice}</div> : null}

        {tab === "hero" && (
          <form className="admin-card form-grid" onSubmit={saveHero}>
            <h2>Hero</h2>
            <label>
              Availability status
              <input
                name="badge"
                defaultValue={hero.badge || "Available for Web, Full-Stack & Mobile Projects"}
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                name="badgeEnabled"
                defaultChecked={hero.badgeEnabled == null ? true : Number(hero.badgeEnabled) !== 0}
              />
              Show availability status on homepage
            </label>
            <label>Greeting<input name="greeting" defaultValue={hero.greeting || ""} /></label>
            <label>Title<input name="title" defaultValue={hero.title || ""} /></label>
            <label>Description<textarea name="description" rows={4} defaultValue={hero.description || ""} /></label>
            <label>Avatar URL<input name="avatarUrl" defaultValue={hero.avatarUrl || ""} /></label>
            <label>Products shipped<input name="statApps" type="number" defaultValue={hero.statApps ?? 0} /></label>
            <label>Years<input name="statYears" type="number" defaultValue={hero.statYears ?? 0} /></label>
            <label>Success %<input name="statSatisfaction" type="number" defaultValue={hero.statSatisfaction ?? 0} /></label>
            <button className="btn" disabled={busy}>Save hero</button>
          </form>
        )}

        {tab === "about" && (
          <form className="admin-card form-grid" onSubmit={saveAbout}>
            <h2>About, contact, WhatsApp, footer</h2>
            <label>Subtitle<input name="subtitle" defaultValue={about.subtitle || ""} /></label>
            <label>Intro title<input name="introTitle" defaultValue={about.introTitle || ""} /></label>
            <label>Intro<textarea name="introText" rows={5} defaultValue={about.introText || ""} /></label>
            <label>Experience summary<input name="experienceSummary" defaultValue={about.experienceSummary || ""} /></label>
            <label>Education summary<input name="educationSummary" defaultValue={about.educationSummary || ""} /></label>
            <label>Email<input name="email" defaultValue={contact.email || ""} /></label>
            <label>Phone<input name="phone" defaultValue={contact.phone || ""} /></label>
            <label>WhatsApp E.164<input name="whatsappE164" defaultValue={settings.whatsappE164 || ""} placeholder="+923001234567" /></label>
            <label>Location<input name="location" defaultValue={contact.location || ""} /></label>
            <label>Footer blurb<textarea name="footerBlurb" rows={3} defaultValue={settings.footerBlurb || ""} /></label>
            <button className="btn" disabled={busy}>Save</button>
          </form>
        )}

        {tab === "experience" && (
          <form
            className="admin-card form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                const experience = JSON.parse(String(fd.get("experienceJson") || "[]"));
                const education = JSON.parse(String(fd.get("educationJson") || "[]"));
                setBusy(true);
                const { res, data } = await adminFetch("/api/admin/content", {
                  method: "PUT",
                  body: JSON.stringify({ experience, education }),
                });
                setBusy(false);
                setNotice(res.ok ? "Experience/education saved." : data.error?.message || "Save failed");
                if (res.ok) setContent(data.content);
              } catch {
                setNotice("Experience/education must be valid JSON arrays.");
              }
            }}
          >
            <h2>Experience & education</h2>
            <label>
              Experience JSON
              <textarea
                name="experienceJson"
                rows={10}
                defaultValue={JSON.stringify(content?.experience || [], null, 2)}
              />
            </label>
            <label>
              Education JSON
              <textarea
                name="educationJson"
                rows={8}
                defaultValue={JSON.stringify(content?.education || [], null, 2)}
              />
            </label>
            <button className="btn" disabled={busy}>
              Save timeline
            </button>
          </form>
        )}

        {tab === "skills" && (
          <form
            className="admin-card form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const skillCategories = JSON.parse(
                  String(new FormData(e.currentTarget).get("skillsJson") || "[]"),
                );
                setBusy(true);
                const { res, data } = await adminFetch("/api/admin/content", {
                  method: "PUT",
                  body: JSON.stringify({ skillCategories }),
                });
                setBusy(false);
                setNotice(res.ok ? "Skills saved — visible on public home." : data.error?.message || "Save failed");
                if (res.ok) setContent(data.content);
              } catch {
                setNotice("Skills JSON must be an array of {title, skills:[{name,level}]}.");
              }
            }}
          >
            <h2>Skills</h2>
            <label>
              Categories JSON
              <textarea
                name="skillsJson"
                rows={14}
                defaultValue={JSON.stringify(
                  (content?.skills || []).map(
                    (c: { title: string; icon?: string | null; skills: Array<{ name: string; level: number; color?: string | null }> }) => ({
                      title: c.title,
                      icon: c.icon || undefined,
                      skills: (c.skills || []).map((s) => ({
                        name: s.name,
                        level: s.level,
                        color: s.color || undefined,
                      })),
                    }),
                  ),
                  null,
                  2,
                )}
              />
            </label>
            <button className="btn" disabled={busy}>
              Save skills
            </button>
          </form>
        )}

        {tab === "projects" && (
          <div>
            <div className="admin-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0 }}>Projects ({projects.length})</h2>
                <p className="muted small" style={{ margin: "0.35rem 0 0" }}>
                  Banner-first showcase. Media modes (static / slideshow / video / custom) and scrolling webpage
                  previews are controlled per project and stored in the database.
                </p>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  openProjectEditor({
                    title: "",
                    slug: "",
                    category: "web-development",
                    workContext: "unassigned",
                    needsGroupReview: 1,
                    typeSlugs: ["web-development"],
                    categorySelect: "web-development",
                    categoryCustomDraft: "",
                    categoryIcon: "web",
                    status: "draft",
                    sortOrder: 0,
                    previewStyle: "banner",
                    showcaseMode: "static",
                    showcaseAutoplay: 1,
                    slideshowIntervalMs: 4200,
                    imageFit: "cover",
                    bannerAspect: "16/10",
                    scrollPreview: 0,
                    isFeatured: 0,
                    coverUrl: "",
                    videoUrl: "",
                    videoPosterUrl: "",
                    screenshots: [],
                    showcaseImageOrder: [],
                  })
                }
              >
                New project
              </button>
            </div>

            {editingProject ? (
              <form
                key={editingProject.id ? `edit-${editingProject.id}` : "create-project"}
                ref={projectFormRef}
                className="admin-card form-grid"
                onSubmit={saveProject}
              >
                <h3 style={{ margin: 0 }}>{editingProject.id ? "Edit project" : "Create project"}</h3>
                <label>Title<input name="title" defaultValue={editingProject.title || ""} required /></label>
                <label>Slug<input name="slug" defaultValue={editingProject.slug || ""} required /></label>

                <div className="admin-taxonomy-panel">
                  <h4>Project taxonomy</h4>
                  <p className="muted small" style={{ margin: 0 }}>
                    Choose a <strong>main category</strong>, then one or more <strong>subcategories</strong>. Custom
                    subcategories are saved to the database and work in shareable <code>/projects?type=…</code> URLs.
                    Do not invent Client vs Freelance — leave as Needs review until known.
                  </p>
                  <div className="admin-taxonomy-grid">
                    <label>
                      1. Main category
                      <select
                        name="workContext"
                        value={editingProject.workContext || "unassigned"}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            workContext: e.target.value,
                            needsGroupReview: e.target.value === "unassigned" ? 1 : 0,
                          })
                        }
                      >
                        <option value="unassigned">Needs review (All Projects only)</option>
                        <option value="client">Client &amp; Company</option>
                        <option value="personal">Freelance &amp; Personal</option>
                      </select>
                    </label>
                    <label>
                      Listing order
                      <input
                        name="sortOrder"
                        type="number"
                        value={editingProject.sortOrder ?? 0}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, sortOrder: Number(e.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      Subcategory icon
                      <select
                        name="categoryIcon"
                        value={editingProject.categoryIcon || "web"}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, categoryIcon: e.target.value })
                        }
                      >
                        {CATEGORY_PRESETS.map((p) => (
                          <option key={`${p.id}-icon`} value={p.icon}>
                            {p.label}
                          </option>
                        ))}
                        <option value="spark">Custom / spark</option>
                      </select>
                    </label>
                  </div>
                  <fieldset className="admin-type-multi" style={{ margin: 0, border: 0, padding: 0 }}>
                    <legend className="muted small" style={{ padding: 0, marginBottom: "0.4rem" }}>
                      2. Subcategories (multi-select)
                    </legend>
                    <div className="admin-type-checks">
                      {(projectTypes.length
                        ? projectTypes.filter((t) => Number(t.enabled) !== 0)
                        : CATEGORY_PRESETS.map((p) => ({ slug: p.id, name: p.label }))
                      ).map((t: { slug: string; name: string }) => {
                        const slug = canonicalizeTypeSlug(t.slug) || t.slug;
                        const checked = (editingProject.typeSlugs || []).includes(slug);
                        return (
                          <label key={slug} className="admin-type-check">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current: string[] = editingProject.typeSlugs || [];
                                const next = checked
                                  ? current.filter((s) => s !== slug)
                                  : [...current, slug];
                                setEditingProject({
                                  ...editingProject,
                                  typeSlugs: next,
                                  category: next[0] || slug,
                                  categorySelect: next[0] || slug,
                                });
                              }}
                            />
                            <span>{t.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <label>
                    Add custom subcategory
                    <input
                      name="categoryCustom"
                      placeholder="e.g. Shopify Apps"
                      value={editingProject.categoryCustomDraft || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          categorySelect: "__custom",
                          categoryCustomDraft: e.target.value,
                        })
                      }
                    />
                  </label>
                  <p className="muted small" style={{ margin: 0 }}>
                    Public filters:{" "}
                    <strong>
                      {editingProject.workContext === "personal"
                        ? "Freelance & Personal"
                        : editingProject.workContext === "client"
                          ? "Client & Company"
                          : "Needs review"}
                    </strong>
                    {" → "}
                    <strong>
                      {(editingProject.typeSlugs || [])
                        .map(
                          (s: string) =>
                            projectTypes.find((t) => t.slug === s)?.name ||
                            CATEGORY_PRESETS.find((p) => p.id === s)?.label ||
                            s,
                        )
                        .join(", ") ||
                        editingProject.categoryCustomDraft ||
                        "—"}
                    </strong>
                    {Number(editingProject.needsGroupReview) === 1 ? " · flagged for group review" : ""}
                  </p>
                </div>

                <label>
                  Status
                  <select name="status" defaultValue={editingProject.status || "draft"}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
                <label>Description<textarea name="description" rows={2} defaultValue={editingProject.description || ""} /></label>
                <label>Long description<textarea name="longDescription" rows={3} defaultValue={editingProject.longDescription || ""} /></label>
                <label>Problem<textarea name="problem" rows={3} defaultValue={editingProject.problem || ""} /></label>
                <label>Solution<textarea name="solution" rows={3} defaultValue={editingProject.solution || ""} /></label>
                <label>Architecture<textarea name="architecture" rows={3} defaultValue={editingProject.architecture || ""} /></label>
                <label>
                  Technologies (comma)
                  <input
                    name="technologies"
                    defaultValue={Array.isArray(editingProject.technologies) ? editingProject.technologies.join(", ") : ""}
                  />
                </label>
                <div className="admin-showcase-panel">
                  <h3>Media &amp; Showcase Settings</h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    Controls homepage Selected Work, /projects listings, and the case-study hero. Phone/browser frames
                    are disabled — banner presentation only.
                  </p>

                  <div className="admin-media-block">
                    <h4>Main banner / thumbnail</h4>
                    {editingProject.coverUrl ? (
                      <div className="admin-media-cover">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editingProject.coverUrl} alt="Banner preview" />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingProject({ ...editingProject, coverUrl: "" })}
                        >
                          Remove banner
                        </button>
                      </div>
                    ) : null}
                    <div className="admin-media-row">
                      <label className="btn btn-secondary btn-sm admin-file-btn">
                        Upload banner
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          hidden
                          disabled={busy}
                          onChange={(e) => {
                            void onCoverUpload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        value={editingProject.coverUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, coverUrl: e.target.value })}
                        placeholder="Or paste banner image URL"
                      />
                    </div>
                  </div>

                  <div className="admin-media-block">
                    <h4>Project images ({(editingProject.shotUrls || []).length})</h4>
                    <p className="muted small">
                      Reorder with arrows. Click an image to include/exclude it in custom order. “Banner” sets it as the
                      main banner.
                    </p>
                    {(editingProject.shotUrls || []).length ? (
                      <div className="admin-shot-grid">
                        {(editingProject.shotUrls || []).map((url: string) => {
                          const selected = (editingProject.showcaseImageOrder || []).includes(url);
                          return (
                            <div key={url} className={`admin-shot ${selected ? "is-selected" : ""}`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt=""
                                onClick={() => toggleVisibleShot(url)}
                                style={{ cursor: "pointer" }}
                                title={selected ? "Visible in custom order" : "Click to include"}
                              />
                              <button type="button" aria-label="Remove image" onClick={() => removeShot(url)}>
                                ×
                              </button>
                              <div className="admin-shot-tools">
                                <button type="button" aria-label="Move left" onClick={() => moveShot(url, -1)}>
                                  ←
                                </button>
                                <button type="button" aria-label="Move right" onClick={() => moveShot(url, 1)}>
                                  →
                                </button>
                                <button type="button" aria-label="Set as banner" onClick={() => setAsBanner(url)}>
                                  ★
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    <div className="admin-media-row">
                      <label className="btn btn-secondary btn-sm admin-file-btn">
                        Upload images
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          multiple
                          hidden
                          disabled={busy}
                          onChange={(e) => {
                            void onScreenshotsUpload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <div className="admin-media-row">
                      <input
                        value={editingProject.shotUrlDraft || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, shotUrlDraft: e.target.value })}
                        placeholder="Or paste image URL"
                      />
                      <button className="btn btn-secondary btn-sm" type="button" onClick={addShotUrl}>
                        Add URL
                      </button>
                    </div>
                  </div>

                  <div className="admin-media-block">
                    <h4>Video</h4>
                    <p className="muted small">
                      Upload mp4/webm or paste YouTube / Vimeo / direct video URL. Poster is used as fallback.
                    </p>
                    {editingProject.videoUrl ? (
                      <div className="admin-media-video">
                        {/\.(mp4|webm|mov)(\?|$)/i.test(editingProject.videoUrl) ||
                        String(editingProject.videoUrl).includes("/api/media/") ? (
                          <video src={editingProject.videoUrl} controls preload="metadata" />
                        ) : (
                          <code className="muted small">{editingProject.videoUrl}</code>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingProject({ ...editingProject, videoUrl: "" })}
                        >
                          Remove video
                        </button>
                      </div>
                    ) : null}
                    <div className="admin-media-row">
                      <label className="btn btn-secondary btn-sm admin-file-btn">
                        Upload video
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          hidden
                          disabled={busy}
                          onChange={(e) => {
                            void onVideoUpload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        value={editingProject.videoUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                        placeholder="Or paste video URL"
                      />
                    </div>
                    <div className="admin-media-row">
                      <label className="btn btn-secondary btn-sm admin-file-btn">
                        Upload poster
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          hidden
                          disabled={busy}
                          onChange={(e) => {
                            void onPosterUpload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <input
                        value={editingProject.videoPosterUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, videoPosterUrl: e.target.value })}
                        placeholder="Video poster URL (optional)"
                      />
                    </div>
                  </div>

                  <div className="admin-media-block">
                    <h4>Display settings</h4>
                    <div className="admin-showcase-grid">
                      <label>
                        Display mode
                        <select
                          value={editingProject.showcaseMode || "static"}
                          onChange={(e) => setEditingProject({ ...editingProject, showcaseMode: e.target.value })}
                        >
                          <option value="static">A — Static banner</option>
                          <option value="slideshow">B — Banner + slideshow</option>
                          <option value="video">C — Video preview</option>
                          <option value="custom">D — Custom image selection</option>
                        </select>
                      </label>
                      <label>
                        Banner aspect
                        <select
                          value={editingProject.bannerAspect || "16/10"}
                          onChange={(e) => setEditingProject({ ...editingProject, bannerAspect: e.target.value })}
                        >
                          <option value="16/10">16:10</option>
                          <option value="16/9">16:9</option>
                          <option value="2/1">2:1</option>
                          <option value="4/3">4:3</option>
                        </select>
                      </label>
                      <label>
                        Image fit
                        <select
                          value={editingProject.imageFit || "cover"}
                          onChange={(e) => setEditingProject({ ...editingProject, imageFit: e.target.value })}
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                        </select>
                      </label>
                      <label>
                        Slideshow interval (ms)
                        <input
                          type="number"
                          min={1500}
                          max={20000}
                          step={100}
                          value={editingProject.slideshowIntervalMs ?? 4200}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              slideshowIntervalMs: Number(e.target.value) || 4200,
                            })
                          }
                        />
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Number(editingProject.showcaseAutoplay) === 1}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, showcaseAutoplay: e.target.checked ? 1 : 0 })
                          }
                        />
                        Enable autoplay (slideshow / muted video)
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Number(editingProject.scrollPreview) === 1}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, scrollPreview: e.target.checked ? 1 : 0 })
                          }
                        />
                        Scrolling website preview (tall screenshot)
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Number(editingProject.isFeatured) === 1}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, isFeatured: e.target.checked ? 1 : 0 })
                          }
                        />
                        Featured on homepage
                      </label>
                    </div>
                  </div>

                  <div className="admin-media-block">
                    <h4>Live preview</h4>
                    <p className="muted small">Listing card appearance (same component as public gallery).</p>
                    <div className="admin-preview-stage">
                      <ProjectBanner
                        title={editingProject.title || "Untitled project"}
                        category={editingProject.category || "web"}
                        coverUrl={editingProject.coverUrl}
                        thumbnailUrl={editingProject.thumbnailUrl}
                        videoUrl={editingProject.videoUrl}
                        videoPosterUrl={editingProject.videoPosterUrl}
                        showcaseMode={editingProject.showcaseMode}
                        showcaseAutoplay={editingProject.showcaseAutoplay}
                        slideshowIntervalMs={editingProject.slideshowIntervalMs}
                        imageFit={editingProject.imageFit}
                        bannerAspect={editingProject.bannerAspect}
                        scrollPreview={editingProject.scrollPreview}
                        showcaseImageOrder={editingProject.showcaseImageOrder}
                        screenshots={(editingProject.shotUrls || []).map((url: string) => ({ url }))}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
                <label>GitHub<input name="githubLink" defaultValue={editingProject.githubLink || ""} /></label>
                <label>Live<input name="liveLink" defaultValue={editingProject.liveLink || ""} /></label>
                <label>Play Store<input name="playStoreLink" defaultValue={editingProject.playStoreLink || ""} /></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  <button className="btn" disabled={busy}>
                    Save project
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditingProject(null)}>
                    Cancel
                  </button>
                  {editingProject.id ? (
                    <button
                      className="btn btn-danger"
                      type="button"
                      disabled={busy}
                      onClick={() => deleteProject({ id: editingProject.id, title: editingProject.title || "project" })}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </form>
            ) : null}

            {projects.map((p) => (
              <div
                key={p.id}
                className="admin-card"
                style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}
              >
                <div>
                  <strong>{p.title}</strong>
                  <div className="muted small">
                    {p.workContext === "personal"
                      ? "Freelance"
                      : p.workContext === "client"
                        ? "Client"
                        : "Needs review"}{" "}
                    → {(p.typeSlugs || [p.category]).join(", ")} · {p.status} · {p.showcaseMode || "static"}
                    {Number(p.scrollPreview) === 1 ? " · scroll" : ""}
                    {Number(p.isFeatured) === 1 ? " · featured" : ""}
                    {Number(p.needsGroupReview) === 1 ? " · review group" : ""} · {p.slug}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => openProjectEditor(p)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    disabled={busy}
                    onClick={() => deleteProject({ id: p.id, title: p.title })}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "services" && (
          <div className="admin-card">
            <h2>Services</h2>
            <p className="muted">
              Homepage rows and SEO pages use these fields. Capabilities are comma-separated. Leave URL blank for{" "}
              <code>/services/&#123;slug&#125;</code>.
            </p>
            {services.map((s, idx) => (
              <div key={s.slug} className="form-grid" style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <label>
                  Title
                  <input
                    value={s.title || ""}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...s, title: e.target.value };
                      setServices(next);
                    }}
                  />
                </label>
                <label>
                  Slug
                  <input value={s.slug} readOnly />
                </label>
                <label>
                  Status
                  <select
                    value={s.status}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...s, status: e.target.value };
                      setServices(next);
                    }}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
                <label>
                  Sort order
                  <input
                    type="number"
                    value={s.sortOrder ?? idx}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...s, sortOrder: Number(e.target.value) };
                      setServices(next);
                    }}
                  />
                </label>
                <label>
                  Summary
                  <textarea
                    rows={2}
                    value={s.summary || ""}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...s, summary: e.target.value };
                      setServices(next);
                    }}
                  />
                </label>
                <label>
                  Capabilities (comma-separated)
                  <input
                    value={Array.isArray(s.capabilities) ? s.capabilities.join(", ") : ""}
                    onChange={(e) => {
                      const caps = e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean);
                      const next = [...services];
                      next[idx] = { ...s, capabilities: caps };
                      setServices(next);
                    }}
                  />
                </label>
                <label>
                  Public URL (optional)
                  <input
                    placeholder={`/services/${s.slug}`}
                    value={s.href || ""}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...s, href: e.target.value };
                      setServices(next);
                    }}
                  />
                </label>
              </div>
            ))}
            <button className="btn" style={{ marginTop: "1rem" }} type="button" disabled={busy} onClick={saveServices}>
              Save services
            </button>
          </div>
        )}

        {tab === "blog" && <BlogAdminPanel />}
        {tab === "blog-traffic" && <BlogTrafficPanel />}
        {tab === "blog-setup" && <BlogSetupPanel />}

        {tab === "resume" && (
          <div className="admin-card form-grid">
            <h2>Resume PDF</h2>
            <p className="muted">Uploads to local secure storage and becomes the public /api/resume download.</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadResume(file);
              }}
            />
            <a className="btn btn-secondary" href="/api/resume">
              Test public download
            </a>
          </div>
        )}

        {tab === "settings" && (
          <div className="admin-card form-grid">
            <h2>Social links</h2>
            <p className="muted">
              These links appear as icons in the footer and contact section. Name examples: GitHub, LinkedIn, Instagram.
            </p>
            {socialDraft.map((row, idx) => (
              <div key={idx} className="form-grid" style={{ gridTemplateColumns: "1fr 1.4fr auto", gap: "0.65rem" }}>
                <label>
                  Name
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...socialDraft];
                      next[idx] = { ...row, name: e.target.value };
                      setSocialDraft(next);
                    }}
                    placeholder="GitHub"
                  />
                </label>
                <label>
                  URL
                  <input
                    value={row.url}
                    onChange={(e) => {
                      const next = [...socialDraft];
                      next[idx] = { ...row, url: e.target.value };
                      setSocialDraft(next);
                    }}
                    placeholder="https://"
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: "end" }}
                  onClick={() => setSocialDraft(socialDraft.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSocialDraft([...socialDraft, { name: "", url: "" }])}
              >
                Add link
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  const social = socialDraft
                    .map((s) => ({ name: s.name.trim(), url: s.url.trim() }))
                    .filter((s) => s.name && s.url);
                  setBusy(true);
                  const { res, data } = await adminFetch("/api/admin/content", {
                    method: "PUT",
                    body: JSON.stringify({ social }),
                  });
                  setBusy(false);
                  setNotice(res.ok ? "Social links saved — visible in footer." : data.error?.message || "Save failed");
                  if (res.ok) {
                    setContent(data.content);
                    setSocialDraft(
                      (data.content?.social || social).map((s: { name: string; url: string }) => ({
                        name: s.name,
                        url: s.url,
                      })),
                    );
                  }
                }}
              >
                Save social links
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
