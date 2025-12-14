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
                    <span className="view-text">View Project</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="portfolio-info">
                <div className="portfolio-category">
                  {project.category === 'android' ? '🤖 Android' : '📱 Flutter'}
                </div>
                <h3 className="portfolio-title">{project.title}</h3>
                <p className="portfolio-description">{project.description}</p>
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
