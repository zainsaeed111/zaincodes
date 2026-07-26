import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);
  const portraitRef = useRef(null);
  const [stats, setStats] = useState({ apps: 0, years: 0, retention: 0 });

  const heroData = (() => {
    try {
      const d = localStorage.getItem('heroData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const badge = heroData?.badge || 'Available for Q3/Q4 Projects';
  const description = heroData?.description || 'From architecture to app store launch. React, Kotlin, and Flutter to convert complex product visions into high-retention digital businesses.';

  const targetApps = heroData?.statApps ?? 50;
  const targetYears = heroData?.statYears ?? 3;
  const targetSatisfaction = heroData?.statSatisfaction ?? 100;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            const duration = 1800;
            const steps = 90;
            const stepDuration = duration / steps;
            let currentStep = 0;
            const interval = setInterval(() => {
              currentStep++;
              const progress = currentStep / steps;
              setStats({
                apps: Math.floor(targetApps * progress),
                years: Math.floor(targetYears * progress),
                retention: Math.floor(targetSatisfaction * progress)
              });
              if (currentStep >= steps) clearInterval(interval);
            }, stepDuration);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [targetApps, targetYears, targetSatisfaction]);

  useEffect(() => {
    const heroSection = heroRef.current;
    const portrait = portraitRef.current;
    if (!heroSection || !portrait) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const rect = heroSection.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const rotateY = -4 + (x - 0.5) * 8;
        const rotateX = 2 + (y - 0.5) * -6;

        portrait.style.transform = `perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      portrait.style.transform = 'perspective(1200px) rotateY(-4deg) rotateX(2deg)';
    };

    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroSection.removeEventListener('mousemove', handleMouseMove);
      heroSection.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="home" className="hero-section section-hero" ref={heroRef}>
      <div className="hero-container container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">{badge}</span>
          </div>

          <h1 className="hero-headline">
            <span className="hero-headline-primary">Zain Saeed</span>
            <span className="hero-headline-accent">Mobile App Developer</span>
            <span className="hero-headline-secondary">& Full-Stack Engineer</span>
          </h1>

          <p className="hero-description">
            {description}
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Start a Project</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="btn-secondary"
              onClick={() => document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore Work</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">{stats.apps}+</div>
              <div className="hero-stat-label">Products Shipped</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">{stats.years}+</div>
              <div className="hero-stat-label">Years Architecture</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">{stats.retention}%</div>
              <div className="hero-stat-label">Client Retention</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          {/* Depth layers - positioned behind the portrait, never overlapping the face */}
          <div className="hero-depth">
            <div className="hero-depth-layer hero-soft-glow" />
            <div className="hero-depth-layer hero-glass-layer" />
            <div className="hero-depth-layer hero-product-layer" />
          </div>

          {/* Portrait - no wrapper, no frame, no border. Direct <img> with 3D transforms */}
          <img
            src="/Profile.webp"
            alt="Zain Saeed"
            className="hero-portrait"
            ref={portraitRef}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
