import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [stats, setStats] = useState({ apps: 0, years: 0, satisfaction: 0 });
  const fullText = "Full-Stack Mobile Application Developer";

  // Typing animation
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Count-up animation for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');

            // Animate stats
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;

            let currentStep = 0;
            const interval = setInterval(() => {
              currentStep++;
              const progress = currentStep / steps;
              setStats({
                apps: Math.floor(50 * progress),
                years: Math.floor(3 * progress),
                satisfaction: Math.floor(100 * progress)
              });
              if (currentStep >= steps) clearInterval(interval);
            }, stepDuration);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Create particles
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        '--delay': `${Math.random() * 5}s`,
        '--x': `${Math.random() * 200 - 100}px`,
        '--y': `${Math.random() * 200 - 100}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero-particles">{particles}</div>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Available for new projects
            </div>
            <h1 className="hero-title">
              Hi, I'm <span className="highlight">Zain</span>
            </h1>
            <h2 className="hero-subtitle">
              {typedText}
              <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
            </h2>
            <p className="hero-description">
              I specialize in creating exceptional mobile experiences using Android (Kotlin/Java)
              and Flutter. With a passion for clean code and innovative solutions, I transform
              ideas into powerful, user-friendly mobile applications that make a difference.
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' })}
              >
                <span>View My Work</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <a
                href={localStorage.getItem('resumeLink') || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                onClick={(e) => {
                  const link = localStorage.getItem('resumeLink');
                  if (!link || link === '#') {
                    e.preventDefault();
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span>📄 Download CV</span>
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{stats.apps}+</span>
                <span className="stat-label">Apps Built</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">{stats.years}+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">{stats.satisfaction}%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <div className="image-glow"></div>
              <img
                src="/Profile.png"
                alt="Zain - Mobile App Developer"
                className="profile-image"
              />
              <div className="floating-elements">
                <div className="floating-icon android">
                  <span>📱</span>
                </div>
                <div className="floating-icon flutter">
                  <span>🎯</span>
                </div>
                <div className="floating-icon kotlin">
                  <span>⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </div>
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-mesh"></div>
      </div>
    </section>
  );
};

export default Hero;
