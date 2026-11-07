"use client";

import Link from "next/link";
import { TechIcon } from "@/components/brand/TechIcon";
import { Reveal } from "@/components/motion/Reveal";

type Skill = { id: number; name: string; level?: number; color?: string | null };
type Category = { id: number; title: string; icon?: string | null; skills: Skill[] };

const DISPLAY_LABEL: Record<string, string> = {
  "Mobile Application Engineering": "Mobile",
  "Web & Admin Portals": "Web & full-stack",
  "Backend & Mobile APIs": "Backend & APIs",
  "Developer Tools & AI": "Tools & AI",
};

const RELATED: Record<string, { label: string; href: string }> = {
  "Mobile Application Engineering": { label: "Android & Flutter work", href: "/projects" },
  "Web & Admin Portals": { label: "Web case studies", href: "/projects" },
  "Backend & Mobile APIs": { label: "Full-stack systems", href: "/services/full-stack-development" },
  "Developer Tools & AI": { label: "Custom software", href: "/services/custom-software-development" },
};

function labelFor(title: string) {
  return DISPLAY_LABEL[title] || title;
}

export function SkillsShowcase({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="section skills-section" id="skills">
      <div className="container">
        <Reveal>
          <div className="section-intro skills-intro">
            <p className="eyebrow">Expertise</p>
            <h2>Technology in production</h2>
            <p>Grouped by how it ships — no percentage bars, only tools used on real projects.</p>
          </div>
        </Reveal>

        <div className="skills-editorial">
          {categories.map((cat, i) => {
            const related = RELATED[cat.title];
            return (
              <Reveal key={cat.id} delay={i * 0.04}>
                <div className="skills-lane">
                  <div className="skills-lane-head">
                    <h3>{labelFor(cat.title)}</h3>
                    {related ? (
                      <Link className="skills-related" href={related.href}>
                        {related.label}
                      </Link>
                    ) : null}
                  </div>
                  <ul className="skills-items">
                    {cat.skills.map((s) => (
                      <li key={s.id} className="skill-item" title={s.name}>
                        <span className="skill-icon-wrap">
                          <TechIcon name={s.name} size={16} />
                        </span>
                        <span className="skill-name">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
