import React, { useEffect, useRef } from 'react';
import './About.css';
import usePortfolioData from '../hooks/usePortfolioData';

const About = () => {
  const { aboutData, heroData } = usePortfolioData();
  const aboutRef = useRef(null);

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

    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, []);

  const statApps = heroData?.statApps ?? 50;
  const statYears = heroData?.statYears ?? 3;

  const subtitle = aboutData?.subtitle || 'End-to-end mobile and web product development — from architecture to app store launch';
  const introTitle = aboutData?.introTitle || 'Zain Saeed — Mobile & Full-Stack Product Engineer';
  const introText = aboutData?.introText || 'Specialising in native Android (Kotlin/Jetpack Compose), Flutter cross-platform applications, and React web platforms. I work with startups and growing companies to ship validated digital products — handling architecture, implementation, and store deployment as a single engineering partner.';
  const techStack = aboutData?.techStack || [];

  const principles = [
    {
      num: '01',
      title: 'System Architecture First',
      description: 'Every product begins with data flow diagrams, database schemas, and API contracts. We design the skeleton before writing the interface.'
    },
    {
      num: '02',
      title: 'Offline-First Reliability',
      description: 'Mobile users live in low-connectivity areas. We engineer local-first caching, background sync, and conflict resolution from day one.'
    },
    {
      num: '03',
      title: 'Performance as a Feature',
      description: 'Sub-500ms database writes, 60FPS UI rendering, and optimized bundle sizes are mandatory requirements for high retention.'
    }
  ];

  const process = [
    { step: 'Discovery', desc: 'Technical scoping, platform selection, architecture review' },
    { step: 'Architecture', desc: 'Database design, API contracts, state management strategy' },
    { step: 'Build', desc: 'Sprint-based development, CI/CD pipelines, automated testing' },
    { step: 'Launch', desc: 'App Store submission, monitoring setup, handoff documentation' }
  ];

  return (
    <section id="about" className="about-section" ref={aboutRef}>
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="section-title">Engineering <span className="text-gradient">Philosophy</span></h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="about-intro-card glass-card">
          <div className="intro-badge">About Architect</div>
          <h3>{introTitle}</h3>
          <p>{introText}</p>

          {techStack.length > 0 && (
            <div className="about-tech-pills">
              {techStack.map((tech, idx) => (
                <span key={idx} className="tech-pill" style={{ '--pill-color': tech.color || '#6366F1' }}>
                  <span className="pill-icon">{tech.icon}</span>
                  <span className="pill-name">{tech.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="about-principles-grid">
          {principles.map((item, index) => (
            <div key={index} className="principle-card glass-card">
              <span className="principle-num text-gradient">{item.num}</span>
              <div className="principle-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="about-process-container glass-card">
          <h4 className="process-header-title">Product Delivery Framework</h4>
          <div className="about-process-track">
            {process.map((item, index) => (
              <div key={index} className="process-step-item">
                <div className="step-badge">{index + 1}</div>
                <span className="process-name">{item.step}</span>
                <span className="process-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-trust-bar">
          <div className="trust-card glass-card">
            <div className="trust-number text-gradient">{statApps}+</div>
            <div className="trust-label">Products Shipped</div>
          </div>
          <div className="trust-card glass-card">
            <div className="trust-number text-emerald-gradient">MVVM</div>
            <div className="trust-label">Clean Architecture</div>
          </div>
          <div className="trust-card glass-card">
            <div className="trust-number text-gradient">BLoC</div>
            <div className="trust-label">State Management</div>
          </div>
          <div className="trust-card glass-card">
            <div className="trust-number text-emerald-gradient">{statYears}+ Years</div>
            <div className="trust-label">Engineering</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
