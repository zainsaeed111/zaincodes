import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';
import usePortfolioData from '../hooks/usePortfolioData';
import { downloadResume } from '../utils/resumeHelper';

const Hero = () => {
  const { heroData } = usePortfolioData();
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const badge = heroData?.badge || 'Available for Android & Flutter Projects';
  const greeting = heroData?.greeting || "Hi, I'm Zain Saeed";
  const title = heroData?.title || 'Android & Flutter Mobile Application Developer';
  const description = heroData?.description || 'Building high-performance native Android (Kotlin/Java) and cross-platform Flutter (Dart) mobile applications from architecture to Play Store launch.';
  const avatarUrl = heroData?.avatarUrl || '/Profile.webp';

  const statApps = heroData?.statApps ?? 15;
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

          {/* Perfectly Aligned 2-Button Hero Row */}
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

            {/* Seamless One-Click Resume Download */}
            <button
              className="btn-resume"
              onClick={downloadResume}
              title="Download Zain Saeed Resume (PDF)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Resume</span>
            </button>
          </div>

          <div className="hero-trust">
            <div
              className="hero-trust-item clickable-trust"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              title="View Shipped Apps"
              style={{ cursor: 'pointer' }}
            >
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
              <span className="badge-icon">📱</span>
              <div className="badge-text">
                <strong>Mobile Specialist</strong>
                <small>Android &amp; Flutter</small>
              </div>
            </div>

            <div className="floating-badge badge-bottom-right">
              <span className="badge-icon">🛡️</span>
              <div className="badge-text">
                <strong>99.9% Crash-Free</strong>
                <small>Production Apps</small>
              </div>
            </div>

            {/* Avatar Hologram Container */}
            <div className="avatar-frame">
              {!imgError ? (
                <img
                  src={avatarUrl}
                  alt="Zain Saeed — Android & Flutter Developer"
                  className="hero-portrait-img"
                  onError={() => setImgError(true)}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="avatar-fallback-3d">
                  <div className="fallback-avatar-icon">📱</div>
                  <div className="fallback-avatar-name">Zain Saeed</div>
                  <div className="fallback-avatar-sub">Android &amp; Flutter Specialist</div>
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
