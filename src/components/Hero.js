import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);
  const portraitRef = useRef(null);

  const heroData = (() => {
    try {
      const d = localStorage.getItem('heroData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const badge = heroData?.badge || 'Available for Q3/Q4 Projects';
  const description = heroData?.description || 'Engineering high-performance mobile products and web platforms from architecture to app store launch.';

  const targetApps = heroData?.statApps ?? 50;
  const targetYears = heroData?.statYears ?? 3;
  const targetSatisfaction = heroData?.statSatisfaction ?? 100;

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
    <section id="home" className="hero-section" ref={heroRef}>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span className="hero-eyebrow-text">{badge}</span>
          </div>

          <h1 className="hero-headline">
            Zain Saeed
          </h1>

          <p className="hero-positioning">Product Engineer &amp; Architect</p>

          <p className="hero-description">
            {description}
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Schedule a Technical Discovery Call</span>
            </button>
            <button
              className="btn-secondary"
              onClick={() => document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' })}
            >
              <span>View Work</span>
            </button>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <span className="hero-trust-number">{targetApps}+</span>
              <span className="hero-trust-label">Products Shipped</span>
            </div>
            <span className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-number">{targetYears}+</span>
              <span className="hero-trust-label">Years Engineering</span>
            </div>
            <span className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-number">{targetSatisfaction}%</span>
              <span className="hero-trust-label">Launch Success</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-portrait-glow" />
          <img
            src="/Profile.webp"
            alt="Zain Saeed — Product Engineer & Architect"
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
