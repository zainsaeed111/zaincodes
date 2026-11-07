import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectBanner } from "@/components/ProjectBanner";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Reveal } from "@/components/motion/Reveal";
import { getProjectBySlug, listPublishedProjects } from "@/lib/content";
import { parseVideoUrl } from "@/lib/media";
import { categoryMetaLabel, resolveCategory } from "@/lib/project-taxonomy";
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
  const related = all.filter((p) => p.slug !== project.slug).slice(0, 3);

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
            <p className="eyebrow">{categoryMetaLabel(project.category, project.workContext)}</p>
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
            <ProjectBanner
              className="case-hero-banner"
              title={project.title}
              category={project.category}
              coverUrl={project.coverUrl}
              thumbnailUrl={project.thumbnailUrl}
              videoUrl={project.videoUrl}
              videoPosterUrl={project.videoPosterUrl}
              showcaseMode={project.showcaseMode}
              showcaseAutoplay={project.showcaseAutoplay}
              slideshowIntervalMs={project.slideshowIntervalMs}
              imageFit={project.imageFit}
              bannerAspect={project.bannerAspect}
              scrollPreview={project.scrollPreview}
              showcaseImageOrder={project.showcaseImageOrder}
              screenshots={project.screenshots}
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

            {images.length > 1 ? (
              <Reveal>
                <section className="case-block">
                  <h2>Gallery</h2>
                  <ProjectGallery images={images} category={project.category} technologies={tech} />
                </section>
              </Reveal>
            ) : null}

            {video ? (
              <Reveal>
                <section className="case-block">
                  <h2>Video</h2>
                  <div className="case-gallery-wrap">
                    {video.canEmbed && video.embedUrl && video.provider !== "direct" ? (
                      <div className="video-embed-frame">
                        <iframe
                          src={video.embedUrl}
                          title={`${project.title} video`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : video.provider === "direct" && video.embedUrl ? (
                      <video
                        src={video.embedUrl}
                        controls
                        playsInline
                        poster={project.videoPosterUrl || project.coverUrl || undefined}
                        style={{ width: "100%", borderRadius: 12 }}
                      />
                    ) : (
                      <a className="btn" href={video.watchUrl} target="_blank" rel="noopener noreferrer">
                        Open video
                      </a>
                    )}
                  </div>
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

            {isPublicUrl(project.liveLink) ||
            isPublicUrl(project.playStoreLink) ||
            isPublicUrl(project.githubLink) ||
            video ? (
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
                  </div>
                </div>
              </Reveal>
            ) : null}
          </aside>
        </div>

        {related.length ? (
          <section className="case-block">
            <h2>Related projects</h2>
            <div className="pg-grid" style={{ marginTop: "1rem" }}>
              {related.map((p) => (
                <article key={p.slug} className="pg-card">
                  <Link href={`/portfolio/${p.slug}`} className="pg-media">
                    <ProjectBanner
                      title={p.title}
                      category={p.category}
                      coverUrl={p.coverUrl}
                      thumbnailUrl={p.thumbnailUrl}
                      videoUrl={p.videoUrl}
                      videoPosterUrl={p.videoPosterUrl}
                      showcaseMode={p.showcaseMode}
                      showcaseAutoplay={0}
                      slideshowIntervalMs={p.slideshowIntervalMs}
                      imageFit={p.imageFit}
                      bannerAspect={p.bannerAspect}
                      scrollPreview={0}
                      showcaseImageOrder={p.showcaseImageOrder}
                      screenshots={p.screenshots}
                      size="sm"
                      interactive={false}
                    />
                  </Link>
                  <div className="pg-body">
                    <p className="pg-cat">{resolveCategory(p.category).label}</p>
                    <h3>
                      <Link href={`/portfolio/${p.slug}`}>{p.title}</Link>
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

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
