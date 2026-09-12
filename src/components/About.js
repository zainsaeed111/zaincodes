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

  const subtitle = aboutData?.subtitle || 'End-to-end Mobile Application Development — Android (Kotlin/Java) & Flutter (Dart)';
  const introTitle = aboutData?.introTitle || 'Zain Saeed — Native Android & Flutter Mobile Developer';
  const introText = aboutData?.introText || 'Specializing in native Android (Kotlin/Java, Jetpack Compose) and cross-platform Flutter (Dart) mobile applications. I work with startups and enterprise clients to ship production, Play Store-published apps — handling architecture, MVVM state management, offline sync, and REST API integration as a dedicated mobile engineering partner.';
  const techStack = aboutData?.techStack || [];

  const principles = [
    {
      num: '01',
      title: 'Mobile Architecture First',
      description: 'Every app begins with robust offline caching, clean data flow models, and REST/GraphQL API contracts built for mobile performance.'
    },
    {
      num: '02',
      title: 'Offline-First Reliability',
      description: 'Mobile users operate in real-world network conditions. We engineer local-first database sync, background workers, and caching from day one.'
    },
    {
      num: '03',
      title: '60FPS Native Performance',
      description: 'Sub-300ms API responses, 60FPS UI rendering, and crash-free Play Store deployments are mandatory standards for mobile retention.'
    }
  ];

  const process = [
    { step: 'Discovery', desc: 'App requirements, target OS, architecture strategy' },
    { step: 'Architecture', desc: 'MVVM setup, database schemas, REST API endpoints' },
    { step: 'Build', desc: 'Sprint development, Android UI/Flutter widgets, CI/CD' },
    { step: 'Play Store Launch', desc: 'Google Play console submission, AAB build, monitoring' }
  ];

  return (
    <section id="about" className="about-section" ref={aboutRef}>
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="section-title">Engineering <span className="text-gradient">Philosophy</span></h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="about-intro-card glass-card">
          <div className="intro-badge">Mobile App Specialist</div>
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
            <div className="trust-number text-gradient">REST API</div>
            <div className="trust-label">Integration</div>
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
