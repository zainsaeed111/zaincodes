import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';

const Portfolio = ({ projects }) => {
  const [filter, setFilter] = useState('all');
  const [animateCards, setAnimateCards] = useState(false);
  const portfolioRef = useRef(null);
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project =>
    filter === 'all' || project.category === filter
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            setAnimateCards(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (portfolioRef.current) {
      observer.observe(portfolioRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Reset animation when filter changes
  useEffect(() => {
    setAnimateCards(false);
    requestAnimationFrame(() => {
      setAnimateCards(true);
    });
  }, [filter]);

  const handleProjectClick = (project) => {
    navigate(`/portfolio/${project.slug}`);
  };

  const filters = [
    { id: 'all', label: 'All Projects', icon: '🎯' },
    { id: 'web', label: 'Web', icon: '🌐' },
    { id: 'android', label: 'Android', icon: '🤖' },
    { id: 'flutter', label: 'Flutter', icon: '📱' }
  ];

  return (
    <section id="portfolio" className="portfolio" ref={portfolioRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">My Portfolio</h2>
          <p className="section-subtitle">
            Showcasing my best mobile applications and projects. Click any project to see full details.
          </p>
        </div>

        <div className="portfolio-filters">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              className={`filter-btn ${filter === filterItem.id ? 'active' : ''}`}
              onClick={() => setFilter(filterItem.id)}
            >
              <span className="filter-icon">{filterItem.icon}</span>
              <span>{filterItem.label}</span>
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`portfolio-item ${animateCards ? 'animate' : ''}`}
              style={{ '--delay': `${index * 0.1}s` }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="portfolio-image">
                <img src={project.thumbnail} alt={project.title} loading="lazy" />
                <div className="portfolio-overlay">
                  <div className="overlay-content">
                    <div className="overlay-buttons">
                      {project.liveLink && project.liveLink !== '#' && (
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="overlay-btn primary" onClick={(e) => e.stopPropagation()}>
                          <span>Live Demo</span>
                        </a>
                      )}
                      <button className="overlay-btn secondary">
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="portfolio-info">
                <div className="portfolio-category">
                  {project.category === 'android' ? '🤖 Android' : project.category === 'flutter' ? '📱 Flutter' : '🌐 Web'}
                </div>
                <h3 className="portfolio-title">{project.title}</h3>
                <p className="portfolio-description">{project.description}</p>
                {project.highlights && project.highlights.length > 0 && (
                  <div className="portfolio-highlights">
                    {project.highlights.slice(0, 2).map((h, idx) => (
                      <span key={idx} className="highlight-badge">✦ {h}</span>
                    ))}
                  </div>
                )}
                <div className="portfolio-tech">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="tech-tag more">+{project.technologies.length - 3}</span>
                  )}
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
