import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Hero = () => {
  const { heroData } = usePortfolioData();
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const badge = heroData?.badge || 'Available for Q3/Q4 Projects';
  const greeting = heroData?.greeting || "Hi, I'm Zain";
  const title = heroData?.title || 'Product Engineer & Architect';
  const description = heroData?.description || 'Engineering high-performance mobile products and web platforms from architecture to app store launch.';
  const avatarUrl = heroData?.avatarUrl || '/Profile.webp';

  const statApps = heroData?.statApps ?? 50;
  const statYears = heroData?.statYears ?? 3;
  const statSatisfaction = heroData?.statSatisfaction ?? 100;

  // 3D Parallax & Tilt Effect
  useEffect(() => {
    const heroSection = heroRef.current;
    const stage = stageRef.current;
    if (!heroSection || !stage) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // 3D rotations & depth moves
        const rotateY = x * 18;
        const rotateX = -y * 14;

        stage.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(20px)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      stage.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
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
      <div className="hero-cyber-grid" />
      <div className="hero-container">
        
        {/* ── Left Content Box ── */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span className="hero-eyebrow-text">{badge}</span>
          </div>

          <div className="hero-greeting-tag">{greeting}</div>

          <h1 className="hero-headline">
            Zain <span className="text-gradient">Saeed</span>
          </h1>

          <h2 className="hero-positioning">{title}</h2>

          <p className="hero-description">{description}</p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Schedule Discovery Call</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <button
              className="btn-secondary"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore Projects</span>
            </button>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <span className="hero-trust-number text-gradient">{statApps}+</span>
              <span className="hero-trust-label">Products Shipped</span>
            </div>
            <span className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-number text-emerald-gradient">{statYears}+ Years</span>
              <span className="hero-trust-label">Engineering</span>
            </div>
            <span className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-number text-gradient">{statSatisfaction}%</span>
              <span className="hero-trust-label">Launch Success</span>
            </div>
          </div>
        </div>

        {/* ── Right Visual: 3D Holographic Stage ── */}
        <div className="hero-visual">
          <div className="holographic-stage" ref={stageRef}>
            {/* Rotating Cyber Energy Ring */}
            <div className="cyber-ring-outer" />
            <div className="cyber-ring-inner" />
            <div className="hologram-glow" />

            {/* Floating 3D Tech Status Badges */}
            <div className="floating-badge badge-top-right">
              <span className="badge-icon">⚡</span>
              <div className="badge-text">
                <strong>Clean Architecture</strong>
                <small>Android &amp; Flutter</small>
              </div>
            </div>

            <div className="floating-badge badge-bottom-left">
              <span className="badge-icon">🚀</span>
              <div className="badge-text">
                <strong>Product Engineer</strong>
                <small>Web &amp; Mobile</small>
              </div>
            </div>

            <div className="floating-badge badge-bottom-right">
              <span className="badge-icon">🛡️</span>
              <div className="badge-text">
                <strong>99.9% Crash-Free</strong>
                <small>Production Quality</small>
              </div>
            </div>

            {/* Avatar Hologram Container */}
            <div className="avatar-frame">
              {!imgError ? (
                <img
                  src={avatarUrl}
                  alt="Zain Saeed — Product Engineer"
                  className="hero-portrait-img"
                  onError={() => setImgError(true)}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="avatar-fallback-3d">
                  <div className="fallback-avatar-icon">👨‍💻</div>
                  <div className="fallback-avatar-name">Zain Saeed</div>
                  <div className="fallback-avatar-sub">Product Architect</div>
                </div>
              )}
              <div className="scanline-overlay" />
              <div className="glass-reflection" />
            </div>

            {/* Base Pedestal Light */}
            <div className="pedestal-glow" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
