"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { ProjectMediaPreview } from "@/components/ProjectMediaPreview";
import { isPublicUrl } from "@/lib/url";

export type WorkItem = {
  slug: string;
  title: string;
  category: string;
  description?: string | null;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
  technologies?: string[] | null;
  videoUrl?: string | null;
  previewStyle?: string | null;
  screenshots?: Array<{ url: string; alt?: string | null; isCover?: boolean }> | null;
  liveLink?: string | null;
  playStoreLink?: string | null;
  githubLink?: string | null;
};

function isMobile(category: string) {
  return category === "android" || category === "flutter";
}

function isFullstack(tech?: string[] | null) {
  return (tech || []).some((t) => /node|express|spring|api|postgres|mongo/i.test(t));
}

function ProjectCopy({ p, featured = false }: { p: WorkItem; featured?: boolean }) {
  const tech = (p.technologies || []).slice(0, featured ? 6 : 4);
  return (
    <div className={`work-copy ${featured ? "is-featured" : ""}`}>
      <span className="work-meta">
        {featured ? "Featured · " : ""}
        {p.category}
        {isFullstack(p.technologies) && p.category === "web" ? " · full stack" : ""}
      </span>
      <h3>{p.title}</h3>
      <p>{p.description}</p>
      {tech.length ? (
        <div className="work-tech">
          {tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      ) : null}
      <div className="work-actions">
        <span className="work-cta">View case study →</span>
        <div className="work-ext" onClick={(e) => e.stopPropagation()}>
          {isPublicUrl(p.liveLink) ? (
            <a href={p.liveLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Live
            </a>
          ) : null}
          {isPublicUrl(p.playStoreLink) ? (
            <a href={p.playStoreLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Play Store
            </a>
          ) : null}
          {isPublicUrl(p.githubLink) ? (
            <a href={p.githubLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function WorkShowcase({ projects }: { projects: WorkItem[] }) {
  const [featured, ...rest] = projects;
  if (!featured) return null;

  return (
    <section className="section work-section" id="work">
      <div className="container">
        <Reveal>
          <div className="work-head">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2>Case studies from shipped products</h2>
            </div>
            <Link className="btn btn-secondary btn-sm" href="/projects">
              All projects
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <article className={`work-feature ${isMobile(featured.category) ? "is-mobile" : "is-web"}`}>
            <Tilt3D className="work-feature-media-tilt" maxTilt={6}>
              <Link href={`/portfolio/${featured.slug}`} className="work-feature-media-link">
                <ProjectMediaPreview
                  title={featured.title}
                  category={featured.category}
                  technologies={featured.technologies}
                  coverUrl={featured.coverUrl}
                  thumbnailUrl={featured.thumbnailUrl}
                  screenshots={featured.screenshots}
                  videoUrl={featured.videoUrl}
                  previewStyle={featured.previewStyle || "banner"}
                  size="lg"
                />
              </Link>
            </Tilt3D>
            <Link href={`/portfolio/${featured.slug}`} className="work-feature-copy-link">
              <ProjectCopy p={featured} featured />
            </Link>
          </article>
        </Reveal>

        {rest.length ? (
          <div className="work-mosaic">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.25)}>
                <article className={`work-tile ${isMobile(p.category) ? "tile-mobile" : "tile-web"}`}>
                  <Tilt3D className="work-tile-media-tilt" maxTilt={5}>
                    <Link href={`/portfolio/${p.slug}`} className="work-tile-media-link">
                      <ProjectMediaPreview
                        title={p.title}
                        category={p.category}
                        technologies={p.technologies}
                        coverUrl={p.coverUrl}
                        thumbnailUrl={p.thumbnailUrl}
                        screenshots={p.screenshots}
                        videoUrl={p.videoUrl}
                        previewStyle={p.previewStyle || "banner"}
                        size="sm"
                      />
                    </Link>
                  </Tilt3D>
                  <Link href={`/portfolio/${p.slug}`}>
                    <ProjectCopy p={p} />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
