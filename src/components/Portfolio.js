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

  return (
    <section id="portfolio" className="portfolio-section" ref={portfolioRef}>
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="section-title">Featured <span className="text-gradient">Products</span></h2>
          <p className="section-subtitle">
            A selection of production-ready products engineered from architecture to launch.
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
          {filteredProjects.map((project) => (
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
                <div className="project-category-badge">{project.category}</div>
                <div className="project-overlay-glow" />
              </div>

              <div className="project-card-body">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description}</p>

                {project.highlights && project.highlights.length > 0 && (
                  <div className="project-highlights">
                    {project.highlights.slice(0, 2).map((h, idx) => (
                      <span key={idx} className="highlight-tag">{h}</span>
                    ))}
                  </div>
                )}

                <div className="project-tech-stack">
                  {(project.technologies || []).slice(0, 4).map((tech, idx) => (
                    <span key={idx} className="tech-badge">{tech}</span>
                  ))}
                </div>

                <div className="project-view-link">
                  <span>View Technical Case Study</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
