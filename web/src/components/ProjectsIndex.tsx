"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProjectCard, type WorkItem } from "@/components/WorkShowcase";
import { Reveal } from "@/components/motion/Reveal";
import {
  WORK_CONTEXTS,
  buildProjectsFilterHref,
  buildShowcaseTree,
  canonicalizeTypeSlug,
  filterProjects,
  resolveCategory,
  shortTypeLabel,
  unassignedProjects,
  type ProjectTypeRecord,
} from "@/lib/project-taxonomy";

type Props = {
  projects: WorkItem[];
  types?: ProjectTypeRecord[];
};

export function ProjectsIndex({ projects, types = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const group = searchParams.get("group") || "";
  const type = canonicalizeTypeSlug(searchParams.get("type") || "");
  const [copied, setCopied] = useState(false);

  const catalog = useMemo(() => {
    if (types.length) return types.filter((t) => t.enabled == null || Number(t.enabled) === 1);
    return Array.from(
      new Map(
        projects.flatMap((p) =>
          (p.typeSlugs?.length ? p.typeSlugs : [p.category]).map((slug) => {
            const meta = resolveCategory(slug, p.categoryIcon);
            return [meta.id, { slug: meta.id, name: meta.label, description: meta.blurb, icon: meta.icon, enabled: 1 }] as const;
          }),
        ),
      ).values(),
    );
  }, [types, projects]);

  const filtered = useMemo(
    () => filterProjects(projects, { group: group || null, type: type || null }),
    [projects, group, type],
  );

  const tree = useMemo(() => buildShowcaseTree(filtered, catalog), [filtered, catalog]);
  const orphan = useMemo(() => (!group && !type ? unassignedProjects(filtered) : []), [filtered, group, type]);
  const isFiltered = Boolean(group || type);

  const setFilter = useCallback(
    (next: { group?: string | null; type?: string | null }) => {
      const href = buildProjectsFilterHref({
        group: next.group === undefined ? group : next.group,
        type: next.type === undefined ? type : next.type,
      });
      router.push(href, { scroll: false });
    },
    [router, group, type],
  );

  const clearFilters = () => router.push(pathname || "/projects", { scroll: false });

  const copyLink = async () => {
    const href = buildProjectsFilterHref({ group, type });
    const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const activeType = type ? resolveCategory(type, null, catalog) : null;
  const activeGroup = WORK_CONTEXTS.find((c) => c.slug === group) || null;

  const renderGrid = (items: WorkItem[]) => (
    <div className="pg-grid pg-grid--gallery">
      {items.map((p, i) => (
        <Reveal key={p.slug} className="pg-grid-item" delay={Math.min(i * 0.03, 0.18)}>
          <ProjectCard p={p} />
        </Reveal>
      ))}
    </div>
  );

  return (
    <main className="section projects-page">
      <div className="container pg-shell">
        <Reveal>
          <header className="pg-intro">
            <div>
              <p className="eyebrow">Portfolio</p>
              <h1 className="pg-page-title">Projects</h1>
              <p className="pg-lead">
                Browse Client &amp; Company and Freelance &amp; Personal work, then refine by discipline. Filters stay
                in the URL for sharing.
              </p>
            </div>
          </header>
        </Reveal>

        <div className="pg-filters" role="search" aria-label="Filter projects">
          <div className="pg-filter-seg" role="group" aria-label="Main group">
            <button type="button" className={!group ? "is-active" : undefined} aria-pressed={!group} onClick={() => setFilter({ group: null })}>
              All
            </button>
            {WORK_CONTEXTS.map((ctx) => (
              <button
                key={ctx.id}
                type="button"
                className={group === ctx.slug ? "is-active" : undefined}
                aria-pressed={group === ctx.slug}
                onClick={() => setFilter({ group: ctx.slug })}
              >
                {ctx.short}
              </button>
            ))}
          </div>

          <div className="pg-filter-type pg-filter-type-mobile">
            <label className="pg-filter-type-label" htmlFor="pg-type-select">
              Type
            </label>
            <select
              id="pg-type-select"
              className="pg-filter-select"
              value={type || ""}
              onChange={(e) => setFilter({ type: e.target.value || null })}
            >
              <option value="">All types</option>
              {catalog.map((t) => {
                const meta = resolveCategory(t.slug, t.icon, catalog);
                return (
                  <option key={t.slug} value={meta.id}>
                    {meta.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="pg-filter-types-desktop" role="group" aria-label="Project type">
            <button type="button" className={!type ? "is-active" : undefined} aria-pressed={!type} onClick={() => setFilter({ type: null })}>
              All types
            </button>
            {catalog.map((t) => {
              const meta = resolveCategory(t.slug, t.icon, catalog);
              return (
                <button
                  key={t.slug}
                  type="button"
                  className={type === meta.id ? "is-active" : undefined}
                  aria-pressed={type === meta.id}
                  onClick={() => setFilter({ type: meta.id })}
                >
                  {shortTypeLabel(meta.id, meta.label)}
                </button>
              );
            })}
          </div>

          <div className="pg-filter-meta">
            {isFiltered ? (
              <>
                <span>
                  {filtered.length} {filtered.length === 1 ? "match" : "matches"}
                  {activeGroup ? ` · ${activeGroup.short}` : ""}
                  {activeType ? ` · ${shortTypeLabel(activeType.id, activeType.label)}` : ""}
                </span>
                <button type="button" className="pg-filter-clear" onClick={clearFilters}>
                  Clear
                </button>
              </>
            ) : null}
            <button type="button" className="pg-copy-link" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        {!filtered.length ? (
          <div className="pg-empty-state" role="status">
            <p>No published projects match this filter.</p>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              View all projects
            </button>
          </div>
        ) : isFiltered ? (
          renderGrid(filtered)
        ) : (
          <>
            {tree.map((ctx) => (
              <section key={ctx.id} className="pg-chapter" aria-labelledby={`projects-ctx-${ctx.id}`}>
                <Reveal>
                  <header className="pg-chapter-head">
                    <h2 id={`projects-ctx-${ctx.id}`}>{ctx.label}</h2>
                    <p>
                      {ctx.count === 1 ? "1 project" : `${ctx.count} projects`}
                      {ctx.blurb ? ` · ${ctx.blurb}` : ""}
                    </p>
                  </header>
                </Reveal>
                {renderGrid(ctx.items)}
              </section>
            ))}

            {orphan.length > 0 ? (
              <section className="pg-chapter" aria-labelledby="projects-ctx-review">
                <Reveal>
                  <header className="pg-chapter-head">
                    <h2 id="projects-ctx-review">Needs review</h2>
                    <p>Listed in All Projects until a main group is assigned in admin.</p>
                  </header>
                </Reveal>
                {renderGrid(orphan)}
              </section>
            ) : null}
          </>
        )}

        <Reveal delay={0.1}>
          <p className="pg-footnote">
            Looking for a specific stack?{" "}
            <Link href="/#contact">Tell me about the product</Link> and I’ll point you to the closest case study.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
