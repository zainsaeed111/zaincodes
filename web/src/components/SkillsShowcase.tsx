"use client";

import { TechIcon } from "@/components/brand/TechIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Tilt3D } from "@/components/motion/Tilt3D";

type Skill = { id: number; name: string; level?: number; color?: string | null };
type Category = { id: number; title: string; icon?: string | null; skills: Skill[] };

const DISPLAY_LABEL: Record<string, string> = {
  "Mobile Application Engineering": "Mobile Development",
  "Web & Admin Portals": "Web & Full-Stack",
  "Backend & Mobile APIs": "Backend & APIs",
  "Developer Tools & AI": "Developer Tools",
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
          <div className="section-intro">
            <p className="eyebrow">Expertise</p>
            <h2>Technology stack in production</h2>
            <p>
              Tools used across shipped Android, Flutter, web, and full-stack work — without arbitrary
              proficiency scores.
            </p>
          </div>
        </Reveal>

        <div className="skills-matrix">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.05}>
              <Tilt3D maxTilt={4}>
                <div className="skills-group">
                  <h3>{labelFor(cat.title)}</h3>
                  <ul className="skills-items">
                    {cat.skills.map((s) => (
                      <li key={s.id} className="skill-item" title={s.name}>
                        <span className="skill-icon-wrap">
                          <TechIcon name={s.name} size={18} />
                        </span>
                        <span className="skill-name">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
