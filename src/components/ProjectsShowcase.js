import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePortfolioData from '../hooks/usePortfolioData';
import './ProjectsShowcase.css';

const ProjectsShowcase = () => {
  const { portfolioProjects } = usePortfolioData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const categories = [
    { id: 'all', label: 'All Projects', icon: '✦' },
    { id: 'android', label: 'Android Native', icon: '🤖' },
    { id: 'flutter', label: 'Flutter Mobile', icon: '💙' },
    { id: 'web', label: 'Web & Full Stack', icon: '🌐' }
  ];

  const getCategoryMeta = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'android':
        return { label: 'Android (Kotlin/Java)', color: '#3DDC84', icon: '🤖', glow: 'rgba(61, 220, 132, 0.25)' };
      case 'flutter':
        return { label: 'Flutter (Dart)', color: '#0284c7', icon: '💙', glow: 'rgba(2, 132, 199, 0.25)' };
      case 'web':
        return { label: 'Web & Full Stack', color: '#8b5cf6', icon: '🌐', glow: 'rgba(139, 92, 246, 0.25)' };
      default:
        return { label: cat || 'Project', color: '#6366f1', icon: '🚀', glow: 'rgba(99, 102, 241, 0.25)' };
    }
  };

  const filteredProjects = useMemo(() => {
    const list = portfolioProjects || [];
    return list.filter((project) => {
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = project.title?.toLowerCase().includes(q);
      const descMatch = (project.description || project.shortDescription || '')?.toLowerCase().includes(q);
      const techMatch = Array.isArray(project.technologies) && project.technologies.some(t => t.toLowerCase().includes(q));

      return titleMatch || descMatch || techMatch;
    });
  }, [portfolioProjects, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const list = portfolioProjects || [];
    return {
      total: list.length,
      android: list.filter(p => p.category === 'android').length,
      flutter: list.filter(p => p.category === 'flutter').length,
      web: list.filter(p => p.category === 'web').length
    };
  }, [portfolioProjects]);

  return (
    <div className="projects-showcase-page">
      {/* Background Ambience */}
      <div className="showcase-glow-orb orb-1" />
      <div className="showcase-glow-orb orb-2" />

      <div className="showcase-container">
        {/* Navigation Bar / Breadcrumb */}
        <div className="showcase-nav-bar">
          <button className="btn-back" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Home</span>
          </button>

          <div className="showcase-breadcrumb">
            <span>Portfolio</span>
            <span className="sep">/</span>
            <span className="current">Projects Showcase</span>
          </div>
        </div>

        {/* Hero Section of Showcase */}
        <header className="showcase-header">
          <div className="showcase-badge">
            <span className="badge-pulse" />
            <span>Curated Software Engineering Portfolio</span>
          </div>
          <h1 className="showcase-headline">
            Production Apps & <span className="text-gradient">Case Studies</span>
          </h1>
          <p className="showcase-subhead">
            Browse published Android Play Store apps, cross-platform Flutter solutions, and full-stack platforms engineered with clean MVVM architecture, high reliability, and pixel-perfect design.
          </p>

          {/* Metrics Strip */}
          <div className="showcase-stats-strip">
            <div className="stat-card">
              <span className="stat-val">{stats.total}</span>
              <span className="stat-label">Total Projects</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-card">
              <span className="stat-val">{stats.android}</span>
              <span className="stat-label">Android Native</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-card">
              <span className="stat-val">{stats.flutter}</span>
              <span className="stat-label">Flutter Cross-Platform</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-card">
              <span className="stat-val">{stats.web}</span>
              <span className="stat-label">Web &amp; Cloud</span>
            </div>
          </div>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="showcase-toolbar">
          {/* Search Box */}
          <div className="showcase-search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app name, tech (e.g. Kotlin, Flutter, Firebase)..."
              aria-label="Search projects"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="view-toggle-group">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              aria-label="List View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="showcase-category-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
              <span className="cat-count">
                {cat.id === 'all'
                  ? portfolioProjects?.length || 0
                  : (portfolioProjects || []).filter(p => p.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Projects Gallery */}
        {filteredProjects.length === 0 ? (
          <div className="showcase-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No projects found</h3>
            <p>No project matched your search query "{searchQuery}". Try searching for another keyword or reset filters.</p>
            <button className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`showcase-projects-grid ${viewMode === 'list' ? 'is-list-view' : ''}`}>
            {filteredProjects.map((project, idx) => {
              const meta = getCategoryMeta(project.category);
              const previewImg = project.image || project.screenshots?.[0] || '/logo192.png';

              return (
                <article
                  key={project.id || idx}
                  className="showcase-card"
                  style={{ '--card-accent': meta.color, '--card-glow': meta.glow }}
                  onClick={() => navigate(`/portfolio/${project.slug}`)}
                >
                  {/* Card Media Preview */}
                  <div className="card-media-wrapper">
                    <img
                      src={previewImg}
                      alt={project.title}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/logo192.png'; }}
                    />
                    <div className="media-overlay" />
                    <span className="card-category-badge" style={{ borderColor: meta.color, color: meta.color }}>
                      <span className="badge-ico">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h3 className="card-title">{project.title}</h3>
                    <p className="card-desc">
                      {project.shortDescription || project.description?.slice(0, 140) + '...'}
                    </p>

                    {/* Tech Pills */}
                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="card-tech-pills">
                        {project.technologies.slice(0, 4).map((tech, tIdx) => (
                          <span key={tIdx} className="tech-pill">{tech}</span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="tech-pill tech-more">+{project.technologies.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-case-study"
                        onClick={() => navigate(`/portfolio/${project.slug}`)}
                      >
                        <span>Case Study</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>

                      <div className="card-external-links">
                        {project.liveUrl && project.liveUrl !== '#' && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ext-link"
                            title="Play Store / Live Preview"
                            aria-label="Live Demo"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        )}

                        {project.githubUrl && project.githubUrl !== '#' && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ext-link"
                            title="GitHub Source"
                            aria-label="GitHub Repository"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsShowcase;
