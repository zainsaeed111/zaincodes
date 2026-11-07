"use client";

import Link from "next/link";
import { CategoryGlyph } from "@/components/brand/CategoryGlyph";
import { ProjectBanner } from "@/components/ProjectBanner";
import { Reveal } from "@/components/motion/Reveal";
import {
  WORK_CONTEXTS,
  buildProjectsFilterHref,
  buildShowcaseTree,
  groupSlugForContext,
  resolveCategory,
  shortTypeLabel,
} from "@/lib/project-taxonomy";
import { isPublicUrl } from "@/lib/url";

export type WorkItem = {
  slug: string;
  title: string;
  category: string;
  workContext?: string | null;
  categoryIcon?: string | null;
  needsGroupReview?: number | null;
  typeSlugs?: string[] | null;
  description?: string | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  showcaseMode?: string | null;
  showcaseAutoplay?: number | null;
  slideshowIntervalMs?: number | null;
  imageFit?: string | null;
  bannerAspect?: string | null;
  scrollPreview?: number | null;
  showcaseImageOrder?: string[] | null;
  isFeatured?: number | null;
  technologies?: string[] | null;
  previewStyle?: string | null;
  screenshots?: Array<{ url: string; alt?: string | null; isCover?: boolean }> | null;
  liveLink?: string | null;
  playStoreLink?: string | null;
  githubLink?: string | null;
};

export function ProjectCard({
  p,
  featured = false,
}: {
  p: WorkItem;
  featured?: boolean;
}) {
  const tech = (p.technologies || []).slice(0, featured ? 6 : 5);
  const cat = resolveCategory(p.category, p.categoryIcon);
  return (
    <article className={`pg-card ${featured ? "is-featured" : ""}`}>
      <Link href={`/portfolio/${p.slug}`} className="pg-media">
        <ProjectBanner
          title={p.title}
          category={p.category}
          coverUrl={p.coverUrl}
          thumbnailUrl={p.thumbnailUrl}
          videoUrl={p.videoUrl}
          videoPosterUrl={p.videoPosterUrl}
          showcaseMode={p.showcaseMode}
          showcaseAutoplay={p.showcaseAutoplay}
          slideshowIntervalMs={p.slideshowIntervalMs}
          imageFit={p.imageFit}
          bannerAspect="16/10"
          scrollPreview={p.scrollPreview}
          showcaseImageOrder={p.showcaseImageOrder}
          screenshots={p.screenshots}
          size="md"
        />
      </Link>
      <div className="pg-body">
        <p className="pg-cat">
          <CategoryGlyph icon={cat.icon} size={12} />
          <span>{cat.label}</span>
        </p>
        <h3>
          <Link href={`/portfolio/${p.slug}`}>{p.title}</Link>
        </h3>
        {tech.length ? (
          <ul className="pg-tech">
            {tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        {p.description ? <p className="pg-desc">{p.description}</p> : null}
        <div className="pg-actions">
          <Link className="pg-cta" href={`/portfolio/${p.slug}`}>
            View case study <span aria-hidden>→</span>
          </Link>
          <div className="pg-ext" onClick={(e) => e.stopPropagation()}>
            {isPublicUrl(p.liveLink) ? (
              <a href={p.liveLink!} target="_blank" rel="noopener noreferrer">
                Live
              </a>
            ) : null}
            {isPublicUrl(p.playStoreLink) ? (
              <a href={p.playStoreLink!} target="_blank" rel="noopener noreferrer">
                Play Store
              </a>
            ) : null}
            {isPublicUrl(p.githubLink) ? (
              <a href={p.githubLink!} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function WorkShowcase({ projects }: { projects: WorkItem[] }) {
  if (!projects.length) return null;

  const featuredList = projects.filter((p) => Number(p.isFeatured) === 1);
  const curated = featuredList.length ? featuredList : projects.slice(0, 6);
  const tree = buildShowcaseTree(curated);

  return (
    <section className="section work-section" id="work">
      <div className="container pg-shell">
        <Reveal>
          <header className="pg-intro">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2>Featured projects</h2>
              <p className="pg-lead">
                A balanced look at shipped products — filter the full gallery by Client, Freelance, Web, Mobile, and
                more.
              </p>
            </div>
            <Link className="pg-all" href="/projects">
              All projects
            </Link>
          </header>
        </Reveal>

        <nav className="pg-home-filters" aria-label="Browse by category">
          {WORK_CONTEXTS.map((ctx) => (
            <Link key={ctx.id} href={buildProjectsFilterHref({ group: ctx.slug })} className="pg-home-chip pg-home-chip--group">
              {ctx.short}
            </Link>
          ))}
          <Link href={buildProjectsFilterHref({ type: "web" })} className="pg-home-chip">
            {shortTypeLabel("web")}
          </Link>
          <Link href={buildProjectsFilterHref({ type: "mobile" })} className="pg-home-chip">
            {shortTypeLabel("mobile")}
          </Link>
          <Link href={buildProjectsFilterHref({ type: "full-stack" })} className="pg-home-chip">
            {shortTypeLabel("full-stack")}
          </Link>
          <Link href={buildProjectsFilterHref({ type: "ai" })} className="pg-home-chip">
            {shortTypeLabel("ai")}
          </Link>
        </nav>

        {tree.map((ctx) => (
          <section key={ctx.id} className="pg-chapter" aria-labelledby={`work-ctx-${ctx.id}`}>
            <Reveal>
              <header className="pg-chapter-head">
                <h3 id={`work-ctx-${ctx.id}`}>{ctx.label}</h3>
                <p>
                  {ctx.count === 1 ? "1 project" : `${ctx.count} projects`}
                  {" · "}
                  <Link className="pg-inline-filter" href={buildProjectsFilterHref({ group: groupSlugForContext(ctx.id) })}>
                    View all
                  </Link>
                </p>
              </header>
            </Reveal>
            <div className="pg-grid pg-grid--gallery">
              {ctx.items.map((p, i) => (
                <Reveal key={p.slug} className="pg-grid-item" delay={Math.min(i * 0.04, 0.2)}>
                  <ProjectCard p={p} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
