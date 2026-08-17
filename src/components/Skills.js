import React, { useEffect, useRef } from 'react';
import './Skills.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Skills = () => {
  const { skillsData } = usePortfolioData();
  const skillsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (skillsRef.current) observer.observe(skillsRef.current);
    return () => observer.disconnect();
  }, []);

  const capabilities = [
    {
      id: 'mobile',
      title: 'Mobile Engineering',
      description: 'Native Android with Kotlin and Jetpack Compose. Cross-platform Flutter with BLoC architecture. Clean offline-first data sync.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      )
    },
    {
      id: 'web',
      title: 'Web Platforms',
      description: 'React and Next.js applications with SSR/SSG, optimized hydration, component design systems, and state management.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    },
    {
      id: 'backend',
      title: 'Backend Systems',
      description: 'Node.js/Express API networks, PostgreSQL, MongoDB, Redis, and Firebase cloud functions built for sub-second latencies.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="3" width="20" height="5" rx="1"/>
          <rect x="2" y="10" width="20" height="5" rx="1"/>
          <rect x="2" y="17" width="20" height="5" rx="1"/>
          <circle cx="6" cy="5.5" r="1" fill="currentColor"/>
          <circle cx="6" cy="12.5" r="1" fill="currentColor"/>
          <circle cx="6" cy="19.5" r="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'delivery',
      title: 'Product Delivery',
      description: 'CI/CD pipelines, automated unit/UI testing, Play Store & App Store submissions, and long-term release lifecycle governance.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    }
  ];

  return (
    <section id="skills" className="skills-section" ref={skillsRef}>
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="section-title">Full-Stack <span className="text-gradient">Capabilities</span></h2>
          <p className="section-subtitle">
            Engineering capabilities across the complete product development lifecycle
          </p>
        </div>

        {/* ── High-Level Capabilities ── */}
        <div className="capabilities-grid">
          {capabilities.map((cap, index) => (
            <div key={cap.id} className="capability-card glass-card">
              <div className="capability-icon">{cap.icon}</div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </div>

        {/* ── Dynamic Skill Categories ── */}
        {skillsData && skillsData.length > 0 && (
          <div className="dynamic-skills-container">
            <h3 className="dynamic-skills-title">Technical Proficiency Index</h3>
            <div className="skills-categories-grid">
              {skillsData.map((cat, idx) => (
                <div key={idx} className="skills-category-card glass-card">
                  <div className="category-header">
                    <span className="category-emoji">{cat.icon}</span>
                    <h4>{cat.title}</h4>
                  </div>
                  <div className="skills-list">
                    {cat.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-percent">{skill.level}%</span>
                        </div>
                        <div className="skill-progress-bg">
                          <div
                            className="skill-progress-fill"
                            style={{
                              width: `${skill.level}%`,
                              background: skill.color ? `linear-gradient(90deg, ${skill.color}, #06b6d4)` : 'var(--gradient-cyber)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
