import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
import usePortfolioData from '../hooks/usePortfolioData';

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
    { id: 'android', label: 'Android', icon: '🤖' },
    { id: 'flutter', label: 'Flutter', icon: '💙' },
    { id: 'web', label: 'Web', icon: '🌐' }
  ];

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'android': return { label: 'Android Native', color: '#3DDC84', icon: '🤖' };
      case 'flutter': return { label: 'Flutter Mobile', color: '#0284c7', icon: '💙' };
      case 'web': return { label: 'Web Platform', color: '#8b5cf6', icon: '🌐' };
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
            <span>PRODUCTION PORTFOLIO</span>
          </div>
          <h2 className="portfolio-title">
            Shipped Products &<br />
            <span className="text-gradient">Case Studies</span>
          </h2>
          <p className="portfolio-subtitle">
            Real-world mobile apps and web platforms — architected, built, and deployed to production.
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
                key={project.id}
                className={`pf-card ${isHovered ? 'is-hovered' : ''}`}
                style={{ '--card-accent': meta.color, '--card-delay': `${idx * 0.08}s` }}
                onClick={() => handleProjectClick(project)}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <div className="pf-card-visual">
                  <img
                    src={project.thumbnail || project.image}
                    alt={project.title}
                    className="pf-card-img"
                    loading="lazy"
                  />
                  <div className="pf-card-img-overlay" />

                  {/* Category Pill */}
                  <div className="pf-card-category" style={{ '--cat-color': meta.color }}>
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </div>

                  {/* Status Indicator */}
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

                  {/* Hover Reveal Arrow */}
                  <div className="pf-card-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="pf-card-content">
                  <h3 className="pf-card-title">{project.title}</h3>
                  <p className="pf-card-desc">{project.description}</p>

                  {/* Tech */}
                  <div className="pf-card-tech">
                    {(project.technologies || []).slice(0, 4).map((tech, i) => (
                      <span key={i} className="pf-tech-pill">{tech}</span>
                    ))}
                    {(project.technologies || []).length > 4 && (
                      <span className="pf-tech-pill pf-tech-more">+{project.technologies.length - 4}</span>
                    )}
                  </div>

                  {/* Metrics */}
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

                  {/* CTA */}
                  <div className="pf-card-cta">
                    <span className="pf-cta-text">Explore Case Study</span>
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
