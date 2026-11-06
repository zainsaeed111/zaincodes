"use client";

import { Reveal } from "@/components/motion/Reveal";

type Props = {
  introTitle?: string | null;
  introText?: string | null;
  location?: string | null;
  experienceSummary?: string | null;
  educationSummary?: string | null;
  company?: string | null;
  years?: number | null;
  productsShipped?: number | null;
  hasResume?: boolean;
};

export function AboutSection({
  introTitle,
  introText,
  location,
  experienceSummary,
  educationSummary,
  company,
  years,
  productsShipped,
  hasResume,
}: Props) {
  const biography =
    introText ||
    "I design and ship web platforms, full-stack systems, and mobile applications with clean architecture and careful craft.";

  const creds: Array<{ label: string; value: string }> = [];
  if (experienceSummary) creds.push({ label: "Focus", value: experienceSummary });
  if (educationSummary) creds.push({ label: "Education", value: educationSummary });
  if (company) creds.push({ label: "Studio", value: company });
  if (years && years > 0) creds.push({ label: "Experience", value: `${years}+ years` });
  if (productsShipped && productsShipped > 0) {
    creds.push({ label: "Shipped", value: `${productsShipped}+ products` });
  }

  return (
    <section className="section about-section" id="about">
      <div className="container about-editorial">
        <Reveal>
          <div className="about-editorial-left">
            <p className="eyebrow">About</p>
            <h2>{introTitle || "Building products people can trust"}</h2>
            {location ? <p className="about-location">{location}</p> : null}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="about-editorial-right">
            <p className="about-lead">{biography}</p>

            {creds.length ? (
              <Reveal delay={0.12}>
                <dl className="about-cred">
                  {creds.slice(0, 4).map((item) => (
                    <div key={item.label} className="about-cred-item">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}

            <div className="about-cta-row">
              <a className="about-cta-inline" href="/#contact">
                Start a conversation
                <em aria-hidden>→</em>
              </a>
              {hasResume ? (
                <a className="about-resume-link" href="/api/resume" target="_blank" rel="noopener noreferrer">
                  Download resume
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
