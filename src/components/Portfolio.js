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

    if (portfolioRef.current) observer.observe(portfolioRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setAnimateCards(false);
    requestAnimationFrame(() => setAnimateCards(true));
  }, [filter]);

  const handleProjectClick = (project) => {
    navigate(`/portfolio/${project.slug}`);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'web', label: 'Web' },
    { id: 'android', label: 'Android' },
    { id: 'flutter', label: 'Flutter' }
  ];

  return (
    <section id="portfolio" className="portfolio section-standard" ref={portfolioRef}>
      <div className="container-narrow">
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">Selected <span>Products</span></h2>
          <p className="section-subtitle">
            A selection of products engineered from architecture to launch.
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

        <div className="portfolio-list">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`portfolio-item ${animateCards ? 'animate' : ''}`}
              style={{ '--delay': `${index * 0.1}s` }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="portfolio-item-visual">
                {project.category === 'web' ? (
                  <div className="device-browser portfolio-browser">
                    <div className="device-browser-header">
                      <div className="device-browser-dot" />
                      <div className="device-browser-dot" />
                      <div className="device-browser-dot" />
                    </div>
                    <div className="device-browser-content">
                      <img src={project.thumbnail} alt={project.title} loading="lazy" />
                    </div>
                  </div>
                ) : (
                  <div className="device-phone portfolio-phone">
                    <div className="device-phone-notch" />
                    <div className="device-phone-screen">
                      <img src={project.thumbnail} alt={project.title} loading="lazy" />
                    </div>
                  </div>
                )}
              </div>
              <div className="portfolio-item-content">
                <div className="portfolio-item-category">
                  {project.category === 'android' ? 'Android' : project.category === 'flutter' ? 'Flutter' : 'Web'}
                </div>
                <h3 className="portfolio-item-title">{project.title}</h3>
                <p className="portfolio-item-description">{project.description}</p>
                {project.highlights && project.highlights.length > 0 && (
                  <div className="portfolio-item-highlights">
                    {project.highlights.slice(0, 2).map((h, idx) => (
                      <span key={idx} className="portfolio-highlight-badge">{h}</span>
                    ))}
                  </div>
                )}
                <div className="portfolio-item-tech">
                  {project.technologies.slice(0, 4).map((tech, idx) => (
                    <span key={idx} className="portfolio-tech-tag">{tech}</span>
                  ))}
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
