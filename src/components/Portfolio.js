import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Portfolio = () => {
  const { portfolioProjects } = usePortfolioData();
  const [filter, setFilter] = useState('all');
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
    { id: 'all', label: 'All Products' },
    { id: 'web', label: 'Web Applications' },
    { id: 'android', label: 'Android Native' },
    { id: 'flutter', label: 'Flutter Mobile' }
  ];

  const getCategoryInfo = (cat) => {
    switch(cat) {
      case 'android': return { label: 'Android Native', icon: '🤖', badgeClass: 'badge-android' };
      case 'flutter': return { label: 'Flutter Mobile', icon: '💙', badgeClass: 'badge-flutter' };
      case 'web': return { label: 'Web Platform', icon: '🌐', badgeClass: 'badge-web' };
      default: return { label: cat, icon: '🚀', badgeClass: 'badge-default' };
    }
  };

  return (
    <section id="portfolio" className="portfolio-section" ref={portfolioRef}>
      <div className="container-narrow">
        <div className="section-header text-center">
          <span className="section-badge">PRODUCTION PORTFOLIO</span>
          <h2 className="section-title">Featured <span className="text-gradient">Products & Apps</span></h2>
          <p className="section-subtitle">
            Enterprise-grade mobile applications and full-stack web platforms engineered from architecture to Play Store & Production deployment.
          </p>
        </div>

        <div className="portfolio-filters">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              className={`filter-btn ${filter === filterItem.id ? 'active' : ''}`}
              onClick={() => setFilter(filterItem.id)}
            >
              <span>{filterItem.label}</span>
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {filteredProjects.map((project) => {
            const catInfo = getCategoryInfo(project.category);
            const hasPlayStore = project.playStoreLink && project.playStoreLink !== '#';
            const hasLiveDemo = project.liveLink && project.liveLink !== '#';

            return (
              <div
                key={project.id}
                className="project-card glass-card"
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-thumb-container">
                  <img
                    src={project.thumbnail || project.image}
                    alt={project.title}
                    className="project-thumb-img"
                    loading="lazy"
                  />
                  <div className={`project-category-badge ${catInfo.badgeClass}`}>
                    <span className="badge-icon-mini">{catInfo.icon}</span>
                    <span>{catInfo.label}</span>
                  </div>

                  {hasPlayStore && (
                    <div className="project-live-indicator">
                      <span className="live-dot green-dot" />
                      <span>Play Store Published</span>
                    </div>
                  )}
                  {!hasPlayStore && hasLiveDemo && (
                    <div className="project-live-indicator">
                      <span className="live-dot blue-dot" />
                      <span>Live Production</span>
                    </div>
                  )}

                  <div className="project-overlay-glow" />
                </div>

                <div className="project-card-body">
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-desc">{project.description}</p>

                  {project.highlights && project.highlights.length > 0 && (
                    <div className="project-highlights">
                      {project.highlights.slice(0, 2).map((h, idx) => (
                        <span key={idx} className="highlight-tag">✨ {h}</span>
                      ))}
                    </div>
                  )}

                  <div className="project-tech-stack">
                    {(project.technologies || []).slice(0, 4).map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </div>

                  <div className="project-card-footer">
                    <div className="project-view-link">
                      <span>Explore Case Study</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
