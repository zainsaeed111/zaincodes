import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, SERVICE_PAGES } from "@/lib/services-content";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Services" };
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: "ZainCodes" },
  };

  return (
    <main className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container" style={{ maxWidth: "760px" }}>
        <p className="eyebrow">Service</p>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: "0.85rem" }}>{service.title}</h1>
        <p style={{ fontSize: "1.15rem", marginBottom: "1.5rem" }}>{service.summary}</p>
        <p style={{ marginBottom: "2rem", color: "var(--faint)" }}>{service.intent}</p>
        <div style={{ display: "grid", gap: "1.1rem", marginBottom: "2.5rem" }}>
          {service.body.map((p) => (
            <p key={p.slice(0, 24)} style={{ fontSize: "1.05rem" }}>
              {p}
            </p>
          ))}
        </div>
        <h2 style={{ marginBottom: "1rem" }}>FAQ</h2>
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          {service.faqs.map((f) => (
            <div key={f.q} className="admin-card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.35rem" }}>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="btn" href="/#contact">
            Discuss this service
          </Link>
          <Link className="btn btn-secondary" href="/projects">
            See related work
          </Link>
        </div>
      </div>
    </main>
  );
}
