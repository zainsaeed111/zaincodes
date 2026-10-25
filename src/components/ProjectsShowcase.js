import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePortfolioData from '../hooks/usePortfolioData';
import { normalizeScreenshots } from '../utils/mediaHelper';
import './ProjectsShowcase.css';

// Dynamic multi-image card media preview
const ShowcaseCardMedia = ({ project, meta }) => {
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

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % images.length);
    }, 4000);
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
    <div className="card-media-wrapper">
      <div className="card-slider-stack">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${project.title} Preview ${i + 1}`}
            className={`card-slide-image ${i === activeIdx ? 'is-active' : ''}`}
            loading="lazy"
            onError={(e) => { e.target.src = '/Profile.webp'; }}
          />
        ))}
      </div>
      <div className="media-overlay" />

      {/* Category Badge */}
      <span className="card-category-badge" style={{ borderColor: meta.color, color: meta.color }}>
        <span className="badge-ico">{meta.icon}</span>
        <span>{meta.label}</span>
      </span>

      {/* Media Indicators (Video & Screenshots count) */}
      <div className="card-media-indicators">
        {hasVideo && (
          <span className="card-video-pill" title="Interactive Video Demo Available">
            <span>▶</span>
            <span>Video</span>
          </span>
        )}
        {images.length > 1 && (
          <span className="card-screens-pill" title="Multiple Screenshots Available">
            <span>📸</span>
            <span>{activeIdx + 1}/{images.length}</span>
          </span>
        )}
      </div>

      {/* Micro Navigation Dots & Arrows */}
      {images.length > 1 && (
        <div className="showcase-card-slide-controls" onClick={(e) => e.stopPropagation()}>
          <button className="sc-slide-arrow prev" onClick={handlePrev} aria-label="Previous image">‹</button>
          <div className="sc-slide-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`sc-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                title={`Go to image ${i + 1}`}
              />
            ))}
          </div>
          <button className="sc-slide-arrow next" onClick={handleNext} aria-label="Next image">›</button>
        </div>
      )}
    </div>
  );
};

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
        return { label: 'Android (Kotlin/Java)', color: '#10b981', icon: '🤖', glow: 'rgba(16, 185, 129, 0.25)' };
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
            <span className="current">All Projects Showcase</span>
          </div>
        </div>

        {/* Showcase Header */}
        <header className="showcase-header">
          <div className="showcase-badge">
            <span className="badge-pulse" />
            <span>Complete Production Portfolio</span>
          </div>
          <h1 className="showcase-headline">
            Explore All <span className="text-gradient">Shipped Applications</span>
          </h1>
          <p className="showcase-subhead">
            Deep dive into technical case studies, production Play Store metrics, Clean Architecture patterns, and live systems engineered by Zain Saeed.
          </p>

          {/* Quick Metrics Strip */}
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

        {/* Filter Category Tabs */}
        <div className="showcase-category-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-chip-icon">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="cat-chip-count">
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

              return (
                <article
                  key={project.id || idx}
                  className="showcase-card"
                  style={{ '--card-accent': meta.color, '--card-glow': meta.glow }}
                  onClick={() => navigate(`/portfolio/${project.slug}`)}
                >
                  {/* Dynamic Multi-Image Carousel Media Header */}
                  <ShowcaseCardMedia project={project} meta={meta} />

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
                            title="Live Demo"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        )}
                        {project.playStoreLink && (
                          <a
                            href={project.playStoreLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ext-link"
                            title="Google Play Store"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ext-link"
                            title="Source Code"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
