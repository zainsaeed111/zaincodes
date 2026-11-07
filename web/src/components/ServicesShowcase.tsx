"use client";

import Link from "next/link";
import { useState } from "react";
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
      <svg className="svc-preview-art" viewBox="0 0 200 128" aria-hidden>
        <rect x="16" y="22" width="168" height="84" rx="8" className="svc-pv-frame" />
        <rect x="16" y="22" width="168" height="16" className="svc-pv-chrome" />
        <circle cx="30" cy="30" r="3" className="svc-pv-dot" />
        <circle cx="42" cy="30" r="3" className="svc-pv-dot" />
        <circle cx="54" cy="30" r="3" className="svc-pv-dot" />
        <rect x="32" y="52" width="70" height="10" rx="2" className="svc-pv-fill" />
        <rect x="32" y="70" width="96" height="5" rx="1.5" className="svc-pv-line" />
        <rect x="32" y="82" width="78" height="5" rx="1.5" className="svc-pv-line" />
        <rect x="140" y="52" width="30" height="36" rx="5" className="svc-pv-accent" />
      </svg>
    );
  }
  if (slug === "full-stack-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 200 128" aria-hidden>
        <rect x="40" y="18" width="120" height="22" rx="5" className="svc-pv-fill" />
        <rect x="54" y="52" width="92" height="20" rx="5" className="svc-pv-accent" />
        <rect x="68" y="86" width="64" height="20" rx="5" className="svc-pv-frame" />
        <path d="M100 40v12M100 72v14" className="svc-pv-path" />
      </svg>
    );
  }
  if (slug === "mobile-app-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 200 128" aria-hidden>
        <rect x="74" y="12" width="52" height="104" rx="10" className="svc-pv-frame" />
        <rect x="82" y="28" width="36" height="68" rx="3" className="svc-pv-fill" />
        <rect x="90" y="102" width="20" height="4" rx="2" className="svc-pv-line" />
        <rect x="48" y="34" width="16" height="56" rx="5" className="svc-pv-accent" opacity="0.55" />
        <rect x="136" y="34" width="16" height="56" rx="5" className="svc-pv-accent" opacity="0.55" />
      </svg>
    );
  }
  if (slug === "custom-software-development") {
    return (
      <svg className="svc-preview-art" viewBox="0 0 200 128" aria-hidden>
        <circle cx="52" cy="64" r="18" className="svc-pv-frame" />
        <circle cx="100" cy="40" r="15" className="svc-pv-accent" />
        <circle cx="100" cy="88" r="15" className="svc-pv-fill" />
        <circle cx="148" cy="64" r="18" className="svc-pv-frame" />
        <path d="M68 56l18-10M68 72l18 10M116 46l18 10M116 82l18-10" className="svc-pv-path" />
      </svg>
    );
  }
  return (
    <svg className="svc-preview-art" viewBox="0 0 200 128" aria-hidden>
      <rect x="24" y="28" width="152" height="72" rx="5" className="svc-pv-frame" />
      <rect x="24" y="28" width="152" height="14" className="svc-pv-chrome" />
      <rect x="36" y="56" width="58" height="32" rx="4" className="svc-pv-fill" />
      <rect x="104" y="56" width="56" height="8" rx="2" className="svc-pv-line" />
      <rect x="104" y="70" width="46" height="8" rx="2" className="svc-pv-line" />
      <rect x="68" y="104" width="64" height="6" rx="2" className="svc-pv-accent" />
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
    const caps = cms?.capabilities && cms.capabilities.length ? cms.capabilities : fb.capabilities;
    return {
      slug,
      title: cms?.title || fb.title,
      summary: cms?.summary || fb.summary,
      capabilities: caps,
      href: (cms?.href && cms.href.trim()) || `/services/${slug}`,
      sortOrder: cms?.sortOrder ?? PRIMARY.indexOf(slug),
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  const [active, setActive] = useState(ordered[0]?.slug || PRIMARY[0]);
  const current = ordered.find((s) => s.slug === active) || ordered[0];

  const secondary = (services || []).filter(
    (s) => s.slug === "flutter-development" || s.slug === "android-development",
  );

  return (
    <section className="section services-section" id="services">
      <div className="container">
        <Reveal>
          <div className="section-intro">
            <p className="eyebrow">Services</p>
            <h2>What I build</h2>
            <p>Five focused offerings — hover a row to preview, open a page for the full brief.</p>
          </div>
        </Reveal>

        <div className="svc-board">
          <div className="svc-index" role="list">
            {ordered.map((s, i) => (
              <Link
                key={s.slug}
                href={s.href}
                role="listitem"
                className={`svc-index-row ${active === s.slug ? "is-active" : ""}`}
                data-service={s.slug}
                onMouseEnter={() => setActive(s.slug)}
                onFocus={() => setActive(s.slug)}
              >
                <span className="svc-num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="svc-index-copy">
                  <strong>{s.title}</strong>
                  <span>{s.summary}</span>
                </span>
                <span className="svc-index-go" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>

          <aside className="svc-stage" aria-live="polite">
            {current ? (
              <>
                <div className="svc-stage-preview">
                  <ServicePreview slug={current.slug} />
                </div>
                <p className="svc-stage-kicker">Service preview</p>
                <h3>{current.title}</h3>
                <p>{current.summary}</p>
                {current.capabilities.length ? (
                  <ul className="svc-stage-caps">
                    {current.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
                <Link className="svc-stage-cta" href={current.href}>
                  Open {current.title}
                </Link>
              </>
            ) : null}
          </aside>
        </div>

        <Reveal delay={0.1}>
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
