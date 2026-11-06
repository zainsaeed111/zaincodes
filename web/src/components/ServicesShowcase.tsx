"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export type ServiceItem = {
  slug: string;
  title: string;
  summary?: string | null;
  capabilities?: string[] | null;
  href?: string | null;
  sortOrder?: number | null;
};

const PRIMARY = [
  "web-development",
  "full-stack-development",
  "mobile-app-development",
  "custom-software-development",
  "desktop-application-development",
] as const;

type PrimarySlug = (typeof PRIMARY)[number];

const FALLBACK: Record<PrimarySlug, { title: string; summary: string; capabilities: string[] }> = {
  "web-development": {
    title: "Web Development",
    summary: "Product sites and customer-facing interfaces with clear hierarchy and maintainable structure.",
    capabilities: ["Next.js / React", "Responsive UI", "SEO foundations"],
  },
  "full-stack-development": {
    title: "Full-Stack Development",
    summary: "APIs, auth, data models, and clients designed as one coherent product system.",
    capabilities: ["API design", "Auth & sessions", "Data modeling"],
  },
  "mobile-app-development": {
    title: "Mobile App Development",
    summary: "Android and Flutter applications from architecture through store-ready release.",
    capabilities: ["Android", "Flutter", "Store readiness"],
  },
  "custom-software-development": {
    title: "Custom Software Development",
    summary: "Software shaped around your workflows, integrations, and operational constraints.",
    capabilities: ["Internal tools", "Integrations", "Admin portals"],
  },
  "desktop-application-development": {
    title: "Desktop Application Development",
    summary: "Desktop clients and companion tools when a browser or phone is not the right surface.",
    capabilities: ["Companion clients", "Offline-first", "OS workflows"],
  },
};

function ServicePreview({ slug }: { slug: string }) {
  if (slug === "web-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 160 100" aria-hidden>
        <rect x="12" y="18" width="136" height="68" rx="6" className="svc-pv-frame" />
        <rect x="12" y="18" width="136" height="14" className="svc-pv-chrome" />
        <circle cx="24" cy="25" r="2.5" className="svc-pv-dot" />
        <circle cx="34" cy="25" r="2.5" className="svc-pv-dot" />
        <circle cx="44" cy="25" r="2.5" className="svc-pv-dot" />
        <rect x="24" y="44" width="52" height="8" rx="2" className="svc-pv-fill" />
        <rect x="24" y="58" width="72" height="4" rx="1" className="svc-pv-line" />
        <rect x="24" y="66" width="60" height="4" rx="1" className="svc-pv-line" />
        <rect x="108" y="44" width="28" height="28" rx="4" className="svc-pv-accent" />
      </svg>
    );
  }
  if (slug === "full-stack-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 160 100" aria-hidden>
        <rect x="28" y="16" width="104" height="18" rx="4" className="svc-pv-fill" />
        <rect x="40" y="42" width="80" height="16" rx="4" className="svc-pv-accent" />
        <rect x="52" y="66" width="56" height="16" rx="4" className="svc-pv-frame" />
        <path d="M80 34v8M80 58v8" className="svc-pv-path" />
      </svg>
    );
  }
  if (slug === "mobile-app-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 160 100" aria-hidden>
        <rect x="58" y="10" width="44" height="80" rx="8" className="svc-pv-frame" />
        <rect x="64" y="22" width="32" height="52" rx="2" className="svc-pv-fill" />
        <rect x="72" y="78" width="16" height="3" rx="1.5" className="svc-pv-line" />
        <rect x="38" y="28" width="14" height="44" rx="4" className="svc-pv-accent" opacity="0.55" />
        <rect x="108" y="28" width="14" height="44" rx="4" className="svc-pv-accent" opacity="0.55" />
      </svg>
    );
  }
  if (slug === "custom-software-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 160 100" aria-hidden>
        <circle cx="40" cy="50" r="14" className="svc-pv-frame" />
        <circle cx="80" cy="32" r="12" className="svc-pv-accent" />
        <circle cx="80" cy="68" r="12" className="svc-pv-fill" />
        <circle cx="120" cy="50" r="14" className="svc-pv-frame" />
        <path d="M52 44l16-8M52 56l16 8M92 36l16 8M92 64l16-8" className="svc-pv-path" />
      </svg>
    );
  }
  return (
    <svg className="svc-preview-art" viewBox="0 0 160 100" aria-hidden>
      <rect x="18" y="22" width="124" height="58" rx="4" className="svc-pv-frame" />
      <rect x="18" y="22" width="124" height="12" className="svc-pv-chrome" />
      <rect x="28" y="44" width="48" height="26" rx="3" className="svc-pv-fill" />
      <rect x="84" y="44" width="46" height="8" rx="2" className="svc-pv-line" />
      <rect x="84" y="56" width="38" height="8" rx="2" className="svc-pv-line" />
      <rect x="48" y="80" width="64" height="6" rx="2" className="svc-pv-accent" />
    </svg>
  );
}

function isPrimary(slug: string): slug is PrimarySlug {
  return (PRIMARY as readonly string[]).includes(slug);
}

export function ServicesShowcase({ services }: { services?: ServiceItem[] | null }) {
  const published = (services || []).filter((s) => isPrimary(s.slug));
  const bySlug = new Map(published.map((s) => [s.slug, s]));

  const ordered = PRIMARY.map((slug) => {
    const cms = bySlug.get(slug);
    const fb = FALLBACK[slug];
    const caps =
      cms?.capabilities && cms.capabilities.length ? cms.capabilities : fb.capabilities;
    return {
      slug,
      title: cms?.title || fb.title,
      summary: cms?.summary || fb.summary,
      capabilities: caps,
      href: (cms?.href && cms.href.trim()) || `/services/${slug}`,
      sortOrder: cms?.sortOrder ?? PRIMARY.indexOf(slug),
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  const secondary = (services || []).filter(
    (s) => s.slug === "flutter-development" || s.slug === "android-development",
  );

  return (
    <section className="section services-section" id="services">
      <div className="container">
        <Reveal>
          <div className="section-intro">
            <p className="eyebrow">Services</p>
            <h2>What I build for clients</h2>
            <p>Focused offerings across web, systems, mobile, custom software, and desktop.</p>
          </div>
        </Reveal>

        <div className="svc-rail" role="list">
          {ordered.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.04}>
              <Link href={s.href} className="svc-row" role="listitem" data-service={s.slug}>
                <span className="svc-num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="svc-copy">
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  {s.capabilities.length ? (
                    <p className="svc-caps-line">
                      {s.capabilities.map((c, idx) => (
                        <span key={c}>
                          {idx > 0 ? (
                            <span className="svc-caps-sep" aria-hidden>
                              {" "}
                              ·{" "}
                            </span>
                          ) : null}
                          {c}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
                <div className="svc-aside">
                  <div className="svc-preview" aria-hidden>
                    <ServicePreview slug={s.slug} />
                  </div>
                  <span className="svc-cta">
                    View service
                    <em aria-hidden>→</em>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="services-sublinks">
            {(secondary.length
              ? secondary
              : [
                  { slug: "flutter-development", title: "Flutter Development" },
                  { slug: "android-development", title: "Android Development" },
                ]
            ).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}>
                {s.title}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
