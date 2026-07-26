import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const aboutRef = useRef(null);

  const aboutData = (() => {
    try {
      const d = localStorage.getItem('aboutData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const heroData = (() => {
    try {
      const d = localStorage.getItem('heroData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            const items = entry.target.querySelectorAll('.animate-on-scroll');
            items.forEach((item, index) => {
              setTimeout(() => item.classList.add('visible'), index * 80);
            });
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

  const principles = [
    {
      num: '01',
      title: 'System Architecture First',
      description: 'Every product begins with data flow diagrams, database schemas, and API contracts. We design the skeleton before we write the interface.'
    },
    {
      num: '02',
      title: 'Offline-First Reliability',
      description: 'Mobile users live in dead zones. We engineer local-first caching, background sync, and conflict resolution before the first deployment.'
    },
    {
      num: '03',
      title: 'Performance as a Feature',
      description: 'Sub-500ms database writes, 60FPS UI rendering, and optimized bundle sizes are not optimizations. They are requirements.'
    }
  ];

  const process = [
    { step: 'Discovery', desc: 'Technical scoping, platform selection, architecture review' },
    { step: 'Architecture', desc: 'Database design, API contracts, state management strategy' },
    { step: 'Build', desc: 'Sprint-based development, CI/CD pipelines, automated testing' },
    { step: 'Launch', desc: 'App Store submission, monitoring setup, handoff documentation' }
  ];

  return (
    <section id="about" className="about section-standard" ref={aboutRef}>
      <div className="container-narrow">
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">Engineering <span>Philosophy</span></h2>
          <p className="section-subtitle">
            {aboutData?.subtitle || 'End-to-end mobile and web product development — from architecture to app store launch'}
          </p>
        </div>

        <div className="about-intro animate-on-scroll">
          <h3>{aboutData?.introTitle || "Zain Saeed — Mobile & Full-Stack Product Engineer"}</h3>
          <p>
            {aboutData?.introText || "Specialising in native Android (Kotlin/Jetpack Compose), Flutter cross-platform applications, and React web platforms. I work with startups and growing companies to ship validated digital products — handling architecture, implementation, and store deployment as a single engineering partner."}
          </p>
        </div>

        <div className="about-principles">
          {principles.map((item, index) => (
            <div key={index} className="about-principle animate-on-scroll">
              <span className="about-principle-num">{item.num}</span>
              <div className="about-principle-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="about-process animate-on-scroll">
          <h4 className="about-process-title">Delivery Process</h4>
          <div className="about-process-track">
            {process.map((item, index) => (
              <div key={index} className="about-process-step">
                <span className="about-process-name">{item.step}</span>
                <span className="about-process-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-trust animate-on-scroll">
          <div className="about-trust-item">
            <div className="about-trust-number">{statApps}+</div>
            <div className="about-trust-label">Products Shipped</div>
          </div>
          <div className="about-trust-item">
            <div className="about-trust-number">MVVM</div>
            <div className="about-trust-label">Clean Architecture</div>
          </div>
          <div className="about-trust-item">
            <div className="about-trust-number">BLoC</div>
            <div className="about-trust-label">State Management</div>
          </div>
          <div className="about-trust-item">
            <div className="about-trust-number">{statYears}+</div>
            <div className="about-trust-label">Years Engineering</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
