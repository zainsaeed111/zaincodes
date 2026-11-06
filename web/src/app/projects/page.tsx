"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectMediaPreview } from "@/components/ProjectMediaPreview";
import { isPublicUrl } from "@/lib/url";

type Project = {
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

const filters = [
  { id: "all", label: "All" },
  { id: "web", label: "Web / Full Stack" },
  { id: "android", label: "Android" },
  { id: "flutter", label: "Flutter" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => setError("Could not load projects."));
  }, []);

  const filtered = useMemo(
    () => projects.filter((p) => filter === "all" || p.category === filter),
    [projects, filter],
  );

  return (
    <main className="section projects-page">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <p className="eyebrow">Portfolio</p>
            <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.2rem)", marginBottom: "0.75rem" }}>
              All case studies
            </h1>
            <p>Web, full-stack, and mobile work with device-aware previews and real project media.</p>
          </div>
        </Reveal>

        <div className="work-filters">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? <div className="notice error">{error}</div> : null}

        <div className="projects-rail">
          {filtered.map((p, i) => {
            const tech = (p.technologies || []).slice(0, 5);
            return (
              <Reveal key={p.slug} delay={Math.min(i * 0.04, 0.28)}>
                <article className="project-row">
                  <Link href={`/portfolio/${p.slug}`} className="project-row-media">
                    <ProjectMediaPreview
                      title={p.title}
                      category={p.category}
                      technologies={p.technologies}
                      coverUrl={p.coverUrl}
                      thumbnailUrl={p.thumbnailUrl}
                      screenshots={p.screenshots}
                      videoUrl={p.videoUrl}
                      previewStyle={p.previewStyle || "banner"}
                      size="md"
                    />
                  </Link>
                  <div className="project-row-copy">
                    <span className="work-meta">{p.category}</span>
                    <h2>
                      <Link href={`/portfolio/${p.slug}`}>{p.title}</Link>
                    </h2>
                    <p>{p.description}</p>
                    {tech.length ? (
                      <div className="work-tech">
                        {tech.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="work-actions">
                      <Link className="work-cta" href={`/portfolio/${p.slug}`}>
                        View case study →
                      </Link>
                      <div className="work-ext">
                        {isPublicUrl(p.liveLink) ? (
                          <a href={p.liveLink} target="_blank" rel="noopener noreferrer">
                            Live
                          </a>
                        ) : null}
                        {isPublicUrl(p.playStoreLink) ? (
                          <a href={p.playStoreLink} target="_blank" rel="noopener noreferrer">
                            Play Store
                          </a>
                        ) : null}
                        {isPublicUrl(p.githubLink) ? (
                          <a href={p.githubLink} target="_blank" rel="noopener noreferrer">
                            GitHub
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}
