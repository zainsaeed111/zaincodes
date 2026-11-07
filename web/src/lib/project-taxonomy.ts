/** Two-level project taxonomy: main groups (Client / Freelance) + DB-backed subcategories. */

export const WORK_CONTEXTS = [
  {
    id: "client",
    slug: "client-company",
    label: "Client & Company",
    short: "Client",
    blurb: "Products shipped for companies, teams, and paying clients.",
  },
  {
    id: "personal",
    slug: "freelance-personal",
    label: "Freelance & Personal",
    short: "Freelance",
    blurb: "Independent builds, experiments, and freelance commissions.",
  },
] as const;

export type WorkContextId = (typeof WORK_CONTEXTS)[number]["id"];

/** Built-in default subcategories — also seeded in the database. Admin can add more. */
export const CATEGORY_PRESETS = [
  {
    id: "web-development",
    label: "Web Development",
    icon: "web",
    blurb: "Sites, portals, and product UI on the open web.",
    aliases: ["web"],
  },
  {
    id: "mobile-app-development",
    label: "Mobile App Development",
    icon: "mobile",
    blurb: "Cross-platform and native mobile apps.",
    aliases: ["mobile", "android", "ios", "flutter"],
  },
  {
    id: "full-stack-development",
    label: "Full-Stack Development",
    icon: "fullstack",
    blurb: "End-to-end product with UI, APIs, and data.",
    aliases: ["fullstack", "full-stack"],
  },
  {
    id: "custom-software-development",
    label: "Custom Software Development",
    icon: "spark",
    blurb: "Bespoke software and product engineering.",
    aliases: ["custom", "ui"],
  },
  {
    id: "ai-projects",
    label: "AI Projects",
    icon: "spark",
    blurb: "Agentic workflows, LLM tooling, and AI product features.",
    aliases: ["ai", "ai-agents"],
  },
  {
    id: "backend-development",
    label: "Backend Development",
    icon: "backend",
    blurb: "APIs, services, and server-side systems.",
    aliases: ["backend"],
  },
  {
    id: "desktop-application-development",
    label: "Desktop Application Development",
    icon: "desktop",
    blurb: "Desktop applications and installable clients.",
    aliases: ["desktop"],
  },
] as const;

export type CategoryPresetId = (typeof CATEGORY_PRESETS)[number]["id"];

export const CATEGORY_PRESET_IDS: string[] = CATEGORY_PRESETS.map((p) => p.id);

export type ProjectTypeRecord = {
  id?: number;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  enabled?: number;
};

export function isWorkContext(value: string | null | undefined): value is WorkContextId {
  return value === "client" || value === "personal";
}

export function isAssignedWorkContext(value: string | null | undefined): value is WorkContextId {
  return isWorkContext(value);
}

/** Never invent ownership — empty/unknown stays unassigned. */
export function normalizeWorkContext(value: string | null | undefined): WorkContextId | "unassigned" {
  if (value === "client" || value === "personal") return value;
  return "unassigned";
}

export function workContextLabel(value: string | null | undefined) {
  const id = normalizeWorkContext(value);
  if (id === "unassigned") return "Needs review";
  return WORK_CONTEXTS.find((c) => c.id === id)?.label || "Needs review";
}

export function workContextFromGroupSlug(group: string | null | undefined): WorkContextId | null {
  const raw = slugifyCategory(group || "");
  if (!raw) return null;
  if (raw === "client-company" || raw === "client") return "client";
  if (raw === "freelance-personal" || raw === "personal" || raw === "freelance") return "personal";
  return null;
}

export function groupSlugForContext(value: string | null | undefined) {
  const id = normalizeWorkContext(value);
  if (id === "client") return "client-company";
  if (id === "personal") return "freelance-personal";
  return null;
}

export function slugifyCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function humanizeCategory(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Compact filter/chip labels for long subcategory names. */
export function shortTypeLabel(slug: string | null | undefined, fullName?: string | null) {
  const id = canonicalizeTypeSlug(slug);
  const map: Record<string, string> = {
    "web-development": "Web",
    "mobile-app-development": "Mobile",
    "full-stack-development": "Full-Stack",
    "custom-software-development": "Custom",
    "ai-projects": "AI",
    "backend-development": "Backend",
    "desktop-application-development": "Desktop",
  };
  if (id && map[id]) return map[id];
  const name = (fullName || humanizeCategory(id || "")).trim();
  if (!name) return "Type";
  const first = name.split(/[\s/·—-]+/).filter(Boolean)[0];
  return first || name;
}

/** Resolve short URL aliases (web, mobile, ai…) to canonical subcategory slugs. */
export function canonicalizeTypeSlug(value: string | null | undefined): string {
  const slug = slugifyCategory(value || "");
  if (!slug) return "";
  for (const preset of CATEGORY_PRESETS) {
    if (preset.id === slug) return preset.id;
    if ((preset.aliases as readonly string[]).includes(slug)) return preset.id;
  }
  return slug;
}

export function isPresetCategory(value: string | null | undefined) {
  const slug = canonicalizeTypeSlug(value);
  return CATEGORY_PRESET_IDS.includes(slug);
}

export function resolveCategory(
  category: string | null | undefined,
  icon?: string | null,
  catalog?: ProjectTypeRecord[] | null,
) {
  const slug = canonicalizeTypeSlug(category) || "web-development";
  const fromDb = catalog?.find((t) => t.slug === slug);
  const preset = CATEGORY_PRESETS.find((p) => p.id === slug);
  return {
    id: slug,
    label: fromDb?.name || preset?.label || humanizeCategory(slug),
    icon: (icon && icon.trim()) || fromDb?.icon || preset?.icon || "spark",
    blurb: fromDb?.description || preset?.blurb || "Custom project subcategory.",
  };
}

export function categoryGroupId(category: string | null | undefined) {
  return resolveCategory(category).id;
}

export function isMobileCategory(category: string | null | undefined) {
  const id = categoryGroupId(category);
  return id === "mobile-app-development" || id === "mobile" || id === "android" || id === "ios" || id === "flutter";
}

export type PreviewFrame = "phone" | "browser" | "stack";

export function resolvePreviewFrame(
  category: string | null | undefined,
  previewStyle?: string | null,
  technologies?: string[] | null,
): PreviewFrame {
  const raw = (previewStyle || "").toLowerCase().trim();
  if (raw === "phone" || raw === "browser" || raw === "stack") return raw;

  const id = categoryGroupId(category);
  if (isMobileCategory(category)) return "phone";
  if (
    id === "full-stack-development" ||
    id === "backend-development" ||
    id === "desktop-application-development" ||
    id === "ai-projects"
  ) {
    return "stack";
  }

  const tech = (technologies || []).join(" ");
  if (/node|express|nestjs|spring|postgres|mongo|docker|kubernetes/i.test(tech)) return "stack";
  return "browser";
}

export function presentationKind(category: string | null | undefined): "mobile" | "web" | "product" {
  const id = categoryGroupId(category);
  if (isMobileCategory(category)) return "mobile";
  if (
    id === "full-stack-development" ||
    id === "backend-development" ||
    id === "desktop-application-development" ||
    id === "ai-projects"
  ) {
    return "product";
  }
  return "web";
}

export function categoryMetaLabel(category: string | null | undefined, workContext?: string | null) {
  return `${workContextLabel(workContext)} · ${resolveCategory(category).label}`;
}

export type WorkLike = {
  category: string;
  workContext?: string | null;
  categoryIcon?: string | null;
  needsGroupReview?: number | null;
  typeSlugs?: string[] | null;
};

export type CategoryBucket<T extends WorkLike> = {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  items: T[];
};

export type ContextBucket<T extends WorkLike> = {
  id: WorkContextId;
  label: string;
  blurb: string;
  categories: CategoryBucket<T>[];
  /** Flat items for a full-width chapter grid */
  items: T[];
  count: number;
};

function projectTypeSlugs(p: WorkLike): string[] {
  if (p.typeSlugs?.length) return p.typeSlugs.map(canonicalizeTypeSlug).filter(Boolean);
  return [canonicalizeTypeSlug(p.category) || "web-development"];
}

export function projectMatchesType(p: WorkLike, typeSlug: string | null | undefined) {
  const want = canonicalizeTypeSlug(typeSlug);
  if (!want) return true;
  return projectTypeSlugs(p).includes(want);
}

export function projectMatchesGroup(p: WorkLike, groupSlug: string | null | undefined) {
  const want = workContextFromGroupSlug(groupSlug);
  if (!want) return true;
  return normalizeWorkContext(p.workContext) === want;
}

export function filterProjects<T extends WorkLike>(
  projects: T[],
  opts: { group?: string | null; type?: string | null },
): T[] {
  return projects.filter(
    (p) => projectMatchesGroup(p, opts.group) && projectMatchesType(p, opts.type),
  );
}

/** Build shareable /projects query string. */
export function buildProjectsFilterHref(opts: { group?: string | null; type?: string | null }) {
  const params = new URLSearchParams();
  const group = slugifyCategory(opts.group || "");
  const type = canonicalizeTypeSlug(opts.type || "");
  if (group) params.set("group", group);
  if (type) params.set("type", type);
  const q = params.toString();
  return q ? `/projects?${q}` : "/projects";
}

/** Main category chapters → flat item lists (full-width grids). Empty chapters omitted. */
export function buildShowcaseTree<T extends WorkLike>(
  projects: T[],
  catalog?: ProjectTypeRecord[] | null,
): ContextBucket<T>[] {
  return WORK_CONTEXTS.map((ctx) => {
    const inContext = projects.filter((p) => normalizeWorkContext(p.workContext) === ctx.id);
    const byCat = new Map<string, CategoryBucket<T>>();

    for (const p of inContext) {
      for (const slug of projectTypeSlugs(p)) {
        const meta = resolveCategory(slug, p.categoryIcon, catalog);
        const existing = byCat.get(meta.id);
        if (existing) {
          if (!existing.items.some((x) => (x as { slug?: string }).slug === (p as { slug?: string }).slug)) {
            existing.items.push(p);
          }
        } else {
          byCat.set(meta.id, { ...meta, items: [p] });
        }
      }
    }

    const presetOrder = CATEGORY_PRESETS.map((p) => p.id);
    const categories = [...byCat.values()].sort((a, b) => {
      const ai = presetOrder.indexOf(a.id as CategoryPresetId);
      const bi = presetOrder.indexOf(b.id as CategoryPresetId);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return {
      id: ctx.id,
      label: ctx.label,
      blurb: ctx.blurb,
      categories,
      items: inContext,
      count: inContext.length,
    };
  }).filter((ctx) => ctx.count > 0);
}

/** Projects with unassigned main category — still listed under All Projects. */
export function unassignedProjects<T extends WorkLike>(projects: T[]): T[] {
  return projects.filter((p) => normalizeWorkContext(p.workContext) === "unassigned");
}
