"use client";

import { Reveal } from "@/components/motion/Reveal";

type Experience = {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  summary?: string | null;
};

type Education = {
  id: number;
  school: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  summary?: string | null;
};

function stripLocationFromCompany(company?: string | null, location?: string | null) {
  if (!company) return "";
  if (!location) return company;
  const cleaned = company.replace(new RegExp(`,\\s*${location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "");
  return cleaned.trim() || company;
}

function dateLine(e: Experience) {
  if (e.startDate || e.endDate) {
    return [e.startDate, e.endDate].filter(Boolean).join(" – ");
  }
  // Seed stores dates in summary like "Sep 2022 – Present (3+ Years)"
  if (e.summary && /–|-|Present|20\d{2}/i.test(e.summary) && e.summary.length < 80) {
    return e.summary;
  }
  return null;
}

function responsibility(e: Experience) {
  const dates = dateLine(e);
  if (e.summary && dates && e.summary.trim() === dates.trim()) return null;
  if (e.summary && dates && e.summary.includes(dates) && e.summary.length < 100) return null;
  return e.summary;
}

function parseEducation(e: Education) {
  const degree = (e.degree || "").trim();
  let raw = (e.school || "").trim();
  let dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
  let location = "";
  let institution = raw;

  // Common seed: "BS Computer Science — Superior University Gold Campus, Lahore (2019 – 2023)"
  const paren = institution.match(/\(([^)]*20\d{2}[^)]*)\)\s*$/);
  if (paren) {
    dates = dates || paren[1].replace(/\s+/g, " ").trim();
    institution = institution.replace(paren[0], "").trim();
  }

  if (degree) {
    institution = institution
      .replace(new RegExp(`^${degree.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"), "")
      .replace(/^[\s—–\-|,:]+/, "")
      .trim();
  } else {
    const split = institution.split(/\s+[—–-]\s+/);
    if (split.length >= 2) {
      return {
        degree: split[0].trim(),
        institution: split.slice(1).join(" — ").replace(/,\s*([^,]+)$/, (_, loc) => {
          location = loc.trim();
          return "";
        }).trim() || split.slice(1).join(" — "),
        location,
        dates,
        field: e.field || null,
        summary: null as string | null,
      };
    }
  }

  const parts = institution.split(/,\s*/);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (/lahore|pakistan|karachi|islamabad|campus/i.test(last) && last.length < 48) {
      location = last;
      institution = parts.slice(0, -1).join(", ").trim();
    }
  }

  const looksLikeDump =
    !e.summary ||
    e.summary === e.school ||
    e.summary === raw ||
    (degree && e.summary.includes(degree) && institution && e.summary.includes(institution.split(",")[0]));

  return {
    degree: degree || institution,
    institution: degree ? institution : institution,
    location,
    dates,
    field: e.field || null,
    summary: looksLikeDump ? null : e.summary,
  };
}

export function JourneySection({
  experience,
  education,
}: {
  experience: Experience[];
  education: Education[];
}) {
  if (!experience.length && !education.length) return null;

  return (
    <section className="section journey-section" id="experience">
      <div className="container">
        <Reveal>
          <div className="journey-head">
            <p className="eyebrow">Journey</p>
            <h2>Experience & education</h2>
          </div>
        </Reveal>

        <div className="journey-layout">
          {experience.length ? (
            <div className="journey-col">
              <h3 className="journey-col-title">Experience</h3>
              <ol className="timeline">
                {experience.map((e, i) => {
                  const company = stripLocationFromCompany(e.company, e.location);
                  const dates = dateLine(e);
                  const body = responsibility(e);
                  return (
                    <Reveal key={e.id} delay={i * 0.06}>
                      <li className="timeline-item">
                        <span className="timeline-marker" aria-hidden />
                        <article className="timeline-card">
                          <div className="timeline-top">
                            <h4>{e.title}</h4>
                            {dates ? <time>{dates}</time> : null}
                          </div>
                          <p className="timeline-org">
                            {[company, e.location].filter(Boolean).join(" · ")}
                          </p>
                          {body ? <p className="timeline-body">{body}</p> : null}
                        </article>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {education.length ? (
            <div className="journey-col">
              <h3 className="journey-col-title">Education</h3>
              <ol className="timeline edu-timeline">
                {education.map((e, i) => {
                  const parsed = parseEducation(e);
                  return (
                    <Reveal key={e.id} delay={i * 0.06}>
                      <li className="timeline-item">
                        <span className="timeline-marker edu" aria-hidden />
                        <article className="timeline-card">
                          <div className="timeline-top">
                            <h4>{parsed.degree}</h4>
                            {parsed.dates ? <time>{parsed.dates}</time> : null}
                          </div>
                          <p className="timeline-org">
                            {[parsed.institution, parsed.location].filter(Boolean).join(" · ")}
                          </p>
                          {parsed.field ? <p className="timeline-body">{parsed.field}</p> : null}
                          {parsed.summary ? <p className="timeline-body">{parsed.summary}</p> : null}
                        </article>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
