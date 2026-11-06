import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ProjectMediaPreview } from "@/components/ProjectMediaPreview";
import { Reveal } from "@/components/motion/Reveal";
import { getProjectBySlug, listPublishedProjects } from "@/lib/content";
import { parseVideoUrl } from "@/lib/media";
import { isPublicUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.description || project.longDescription || undefined,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      title: project.title,
      description: project.description || undefined,
      images: project.coverUrl ? [project.coverUrl] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await listPublishedProjects();
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length];
  const prev = all[(idx - 1 + all.length) % all.length];

  const images = [
    ...(project.coverUrl ? [{ url: project.coverUrl, alt: project.title }] : []),
    ...((project.screenshots || []).map((s) => ({ url: s.url, alt: s.alt }))),
  ].filter((img, i, arr) => arr.findIndex((x) => x.url === img.url) === i);

  const tech = (project.technologies as string[] | null) || [];
  const features = (project.features as string[] | null) || [];
  const highlights = (project.highlights as string[] | null) || [];
  const video = parseVideoUrl(project.videoUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `/portfolio/${project.slug}`,
  };

  return (
    <main className="case-study">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="case-hero">
        <div className="container case-hero-grid">
          <div className="case-hero-copy">
            <Link href="/projects" className="case-back">
              ← All projects
            </Link>
            <p className="eyebrow">{project.category}</p>
            <h1>{project.title}</h1>
            {project.description ? <p className="case-summary">{project.description}</p> : null}
            <div className="case-actions">
              {isPublicUrl(project.liveLink) ? (
                <a className="btn" href={project.liveLink} target="_blank" rel="noopener noreferrer">
                  Live demo
                </a>
              ) : null}
              {isPublicUrl(project.playStoreLink) ? (
                <a className="btn btn-secondary" href={project.playStoreLink} target="_blank" rel="noopener noreferrer">
                  Play Store
                </a>
              ) : null}
              {isPublicUrl(project.githubLink) ? (
                <a className="btn btn-secondary" href={project.githubLink} target="_blank" rel="noopener noreferrer">
                  Source
                </a>
              ) : null}
              {video ? (
                <a className="btn btn-secondary" href={video.watchUrl} target="_blank" rel="noopener noreferrer">
                  Watch video
                </a>
              ) : null}
            </div>
          </div>
          <div className="case-hero-media">
            <ProjectMediaPreview
              title={project.title}
              category={project.category}
              technologies={tech}
              coverUrl={project.coverUrl}
              thumbnailUrl={project.thumbnailUrl}
              screenshots={project.screenshots}
              videoUrl={project.videoUrl}
              previewStyle={project.previewStyle || "banner"}
              size="lg"
            />
          </div>
        </div>
      </div>

      <div className="container case-body">
        <div className="case-grid">
          <div className="case-main">
            {project.longDescription ? (
              <Reveal>
                <section className="case-block">
                  <h2>Overview</h2>
                  <p className="case-prose">{project.longDescription}</p>
                </section>
              </Reveal>
            ) : null}

            {project.problem ? (
              <Reveal>
                <section className="case-block">
                  <h2>Problem</h2>
                  <p className="case-prose">{project.problem}</p>
                </section>
              </Reveal>
            ) : null}

            {project.solution ? (
              <Reveal>
                <section className="case-block">
                  <h2>Solution</h2>
                  <p className="case-prose">{project.solution}</p>
                </section>
              </Reveal>
            ) : null}

            {features.length ? (
              <Reveal>
                <section className="case-block">
                  <h2>Features</h2>
                  <ul className="case-list">
                    {features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ) : null}

            {project.architecture ? (
              <Reveal>
                <section className="case-block">
                  <h2>Architecture</h2>
                  <p className="case-prose">{project.architecture}</p>
                </section>
              </Reveal>
            ) : null}

            {images.length ? (
              <Reveal>
                <section className="case-block">
                  <h2>Gallery</h2>
                  <ProjectGallery images={images} category={project.category} technologies={tech} />
                </section>
              </Reveal>
            ) : null}
          </div>

          <aside className="case-aside">
            {tech.length ? (
              <Reveal>
                <div className="case-meta-card">
                  <h3>Stack</h3>
                  <div className="case-tags">
                    {tech.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}

            {highlights.length ? (
              <Reveal delay={0.05}>
                <div className="case-meta-card">
                  <h3>Highlights</h3>
                  <ul className="case-list compact">
                    {highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            <Reveal delay={0.08}>
              <div className="case-meta-card">
                <h3>Links</h3>
                <div className="case-aside-links">
                  {isPublicUrl(project.liveLink) ? (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                      Live demo
                    </a>
                  ) : null}
                  {isPublicUrl(project.playStoreLink) ? (
                    <a href={project.playStoreLink} target="_blank" rel="noopener noreferrer">
                      Play Store
                    </a>
                  ) : null}
                  {isPublicUrl(project.githubLink) ? (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  ) : null}
                  {video ? (
                    <a href={video.watchUrl} target="_blank" rel="noopener noreferrer">
                      Video
                    </a>
                  ) : null}
                  {!isPublicUrl(project.liveLink) &&
                  !isPublicUrl(project.playStoreLink) &&
                  !isPublicUrl(project.githubLink) &&
                  !video ? (
                    <p className="muted">No public links for this project.</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>

        <div className="case-nav">
          {prev && prev.slug !== project.slug ? (
            <Link href={`/portfolio/${prev.slug}`} className="case-nav-link">
              <span>Previous</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next && next.slug !== project.slug ? (
            <Link href={`/portfolio/${next.slug}`} className="case-nav-link next">
              <span>Next</span>
              <strong>{next.title}</strong>
            </Link>
          ) : null}
        </div>

        <div className="case-cta-band">
          <div>
            <h2>Have a similar product in mind?</h2>
            <p>Tell me about the goals, timeline, and constraints — I’ll reply with a clear next step.</p>
          </div>
          <Link className="btn" href="/#contact">
            Start a project
          </Link>
        </div>
      </div>
    </main>
  );
}
