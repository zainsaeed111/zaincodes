import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
import usePortfolioData from '../hooks/usePortfolioData';
import { normalizeScreenshots } from '../utils/mediaHelper';

// Subcomponent for interactive auto-rotating screenshot preview
const PortfolioCardVisual = ({ project, meta, isValidLink }) => {
  const images = useMemo(() => {
    const list = [];
    if (project.thumbnail) list.push(project.thumbnail);
    if (project.image && !list.includes(project.image)) list.push(project.image);
    const extra = normalizeScreenshots(project.screenshots);
    extra.forEach(img => {
      if (!list.includes(img)) list.push(img);
    });
    return list.length > 0 ? list : ['/Profile.webp'];
  }, [project]);

  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-rotate screenshots every 3.8s if multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % images.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [images.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx(prev => (prev + 1) % images.length);
  };

  const hasVideo = Boolean(project.videoUrl || project.videoLink || project.demoVideo);

  return (
    <div className="pf-card-visual">
      {/* Sliding Images with Smooth Crossfade */}
      <div className="pf-card-slider">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${project.title} Preview ${i + 1}`}
            className={`pf-card-img ${i === activeIdx ? 'is-active' : ''}`}
            loading="lazy"
            onError={(e) => { e.target.src = '/Profile.webp'; }}
          />
        ))}
      </div>

      <div className="pf-card-img-overlay" />

      {/* Category Pill */}
      <div className="pf-card-category" style={{ '--cat-color': meta.color }}>
        <span className="cat-icon">{meta.icon}</span>
        <span className="cat-label">{meta.label}</span>
      </div>

      {/* Top Right Badges */}
      <div className="pf-card-top-badges">
        {hasVideo && (
          <div className="pf-card-status pf-status-video" title="Interactive Video Demo Available">
            <span>▶</span>
            <span>Video</span>
          </div>
        )}
        {isValidLink(project.playStoreLink) && (
          <div className="pf-card-status pf-status-live">
            <span className="pf-status-pulse" />
            <span>Published</span>
          </div>
        )}
        {!isValidLink(project.playStoreLink) && isValidLink(project.liveLink) && (
          <div className="pf-card-status pf-status-production">
            <span className="pf-status-pulse blue" />
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Interactive Micro Slideshow Controls (Arrows & Dot Indicators) */}
      {images.length > 1 && (
        <div className="pf-card-slide-controls" onClick={(e) => e.stopPropagation()}>
          <button className="pf-slide-arrow prev" onClick={handlePrev} aria-label="Previous image">‹</button>
          <div className="pf-slide-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`pf-slide-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                title={`Go to image ${i + 1}`}
              />
            ))}
          </div>
          <button className="pf-slide-arrow next" onClick={handleNext} aria-label="Next image">›</button>
          <span className="pf-screens-counter">📸 {activeIdx + 1}/{images.length}</span>
        </div>
      )}

      {/* Hover Reveal Diagonal Arrow */}
      <div className="pf-card-arrow">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const { portfolioProjects } = usePortfolioData();
  const [filter, setFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const portfolioRef = useRef(null);
  const navigate = useNavigate();

  const filteredProjects = (portfolioProjects || []).filter(project =>
    filter === 'all' || project.category === filter
  );

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

    if (portfolioRef.current) observer.observe(portfolioRef.current);
    return () => observer.disconnect();
  }, []);

  const handleProjectClick = (project) => {
    navigate(`/portfolio/${project.slug}`);
  };

  const filters = [
    { id: 'all', label: 'All', icon: '◆' },
    { id: 'android', label: 'Android Native', icon: '🤖' },
    { id: 'flutter', label: 'Flutter Apps', icon: '💙' },
    { id: 'web', label: 'Web Platform', icon: '🌐' }
  ];

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'android': return { label: 'Android Native App', color: '#10b981', icon: '🤖' };
      case 'flutter': return { label: 'Flutter Mobile App', color: '#0284c7', icon: '💙' };
      case 'web': return { label: 'Web & Cloud Dashboard', color: '#8b5cf6', icon: '🌐' };
      default: return { label: cat, color: '#6366f1', icon: '🚀' };
    }
  };

  const isValidLink = (link) => link && link.trim() !== '' && link.trim() !== '#';

  return (
    <section id="portfolio" className="portfolio-section" ref={portfolioRef}>
      <div className="portfolio-container">
        {/* Header */}
        <div className="portfolio-header">
          <div className="portfolio-header-badge">
            <span className="header-badge-dot" />
            <span>MOBILE PRODUCTION PORTFOLIO</span>
          </div>
          <h2 className="portfolio-title">
            Featured Apps &amp;<br />
            <span className="text-gradient">Production Case Studies</span>
          </h2>
          <p className="portfolio-subtitle">
            Published Android apps, Flutter cross-platform applications, and high-performance cloud backends — architected, tested, and deployed to millions of devices.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="portfolio-filter-bar">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`pf-filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              <span className="pf-filter-icon">{f.icon}</span>
              <span>{f.label}</span>
              {filter === f.id && <span className="pf-filter-count">{f.id === 'all' ? portfolioProjects?.length || 0 : filteredProjects.length}</span>}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="portfolio-gallery">
          {filteredProjects.map((project, idx) => {
            const meta = getCategoryMeta(project.category);
            const isHovered = hoveredId === project.id;

            return (
              <article
                key={project.id || idx}
                className={`pf-card ${isHovered ? 'is-hovered' : ''}`}
                style={{ '--card-accent': meta.color, '--card-delay': `${idx * 0.08}s` }}
                onClick={() => handleProjectClick(project)}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Visual Image Carousel Header */}
                <PortfolioCardVisual
                  project={project}
                  meta={meta}
                  isValidLink={isValidLink}
                />

                {/* Content Body */}
                <div className="pf-card-content">
                  <h3 className="pf-card-title">{project.title}</h3>
                  <p className="pf-card-desc">{project.description}</p>

                  {/* Tech Stack Pills */}
                  <div className="pf-card-tech">
                    {(project.technologies || []).slice(0, 4).map((tech, i) => (
                      <span key={i} className="pf-tech-pill">{tech}</span>
                    ))}
                    {(project.technologies || []).length > 4 && (
                      <span className="pf-tech-pill pf-tech-more">+{project.technologies.length - 4}</span>
                    )}
                  </div>

                  {/* Highlights / Metrics */}
                  {project.highlights && project.highlights.length > 0 && (
                    <div className="pf-card-metrics">
                      {project.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="pf-metric">
                          <span className="pf-metric-icon">✦</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card CTA Footer */}
                  <div className="pf-card-cta">
                    <span className="pf-cta-text">Explore Full Case Study</span>
                    <span className="pf-cta-arrow">→</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
