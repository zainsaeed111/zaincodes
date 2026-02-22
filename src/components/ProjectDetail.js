import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProjectDetail.css';

const ProjectDetail = ({ projects }) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const contentRef = useRef(null);

    const project = projects.find(p => p.slug === slug);

    useEffect(() => {
        if (!project) {
            navigate('/');
        } else {
            // Trigger animations
            setTimeout(() => setIsVisible(true), 100);
        }
    }, [project, navigate]);

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

        if (contentRef.current) {
            const sections = contentRef.current.querySelectorAll('.animate-on-scroll');
            sections.forEach(section => observer.observe(section));
        }

        return () => observer.disconnect();
    }, [project]);

    if (!project) {
        return null;
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareOnTwitter = () => {
        const text = `Check out this amazing ${project.title} app by @ZainCodes!`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    // Get related projects (same category, excluding current)
    const relatedProjects = projects
        .filter(p => p.category === project.category && p.id !== project.id)
        .slice(0, 2);

    return (
        <div className={`project-detail ${isVisible ? 'visible' : ''}`}>
            {/* Hero Section */}
            <section className="project-hero">
                <div className="hero-background">
                    <img src={project.image} alt={project.title} className="hero-bg-image" />
                    <div className="hero-overlay"></div>
                </div>
                <div className="container hero-content">
                    <Link to="/#portfolio" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Portfolio
                    </Link>
                    <div className="project-meta">
                        <span className="project-category-badge">
                            {project.category === 'android' ? '🤖 Android' : project.category === 'flutter' ? '📱 Flutter' : '🌐 Web'}
                        </span>
                    </div>
                    <h1 className="project-title">{project.title}</h1>
                    <p className="project-tagline">{project.description}</p>

                    <div className="project-actions">
                        {project.liveLink && project.liveLink !== '#' && (
                            <a href={project.liveLink} className="btn-primary" target="_blank" rel="noopener noreferrer">
                                <span>{project.category === 'web' ? 'View Live Demo' : 'View Application'}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                            </a>
                        )}
                        {project.category !== 'web' && project.playStoreLink && project.playStoreLink !== '#' && (
                            <a href={project.playStoreLink} className="btn-primary" target="_blank" rel="noopener noreferrer">
                                <span>View on Play Store</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                            </a>
                        )}
                        <a href={project.githubLink} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                            <span>View Source Code</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="project-content" ref={contentRef}>
                <div className="container">
                    {/* Share Section */}
                    <div className="share-section animate-on-scroll">
                        <span className="share-label">Share this project:</span>
                        <div className="share-buttons">
                            <button
                                className={`share-btn ${copied ? 'copied' : ''}`}
                                onClick={copyLink}
                                title="Copy link"
                            >
                                {copied ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                        </svg>
                                        Copy Link
                                    </>
                                )}
                            </button>
                            <button className="share-btn twitter" onClick={shareOnTwitter} title="Share on Twitter">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </button>
                            <button className="share-btn linkedin" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <section className="content-section animate-on-scroll">
                        <h2 className="section-heading">About This Project</h2>
                        <p className="project-long-description">{project.longDescription}</p>
                    </section>

                    {/* Technologies */}
                    <section className="content-section animate-on-scroll">
                        <h2 className="section-heading">Technologies Used</h2>
                        <div className="tech-grid">
                            {project.technologies.map((tech, idx) => (
                                <div key={idx} className="tech-item">
                                    <span className="tech-name">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features */}
                    <section className="content-section animate-on-scroll">
                        <h2 className="section-heading">Key Features</h2>
                        <div className="features-grid">
                            {project.features.map((feature, idx) => (
                                <div key={idx} className="feature-card">
                                    <div className="feature-icon">✓</div>
                                    <span className="feature-text">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Highlights */}
                    <section className="content-section animate-on-scroll">
                        <h2 className="section-heading">Highlights</h2>
                        <div className="highlights-grid">
                            {project.highlights.map((highlight, idx) => (
                                <div key={idx} className="highlight-card">
                                    <div className="highlight-number">{idx + 1}</div>
                                    <span className="highlight-text">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Related Projects */}
                    {relatedProjects.length > 0 && (
                        <section className="content-section animate-on-scroll">
                            <h2 className="section-heading">Related Projects</h2>
                            <div className="related-grid">
                                {relatedProjects.map((relatedProject) => (
                                    <Link
                                        key={relatedProject.id}
                                        to={`/portfolio/${relatedProject.slug}`}
                                        className="related-card"
                                    >
                                        <div className="related-image">
                                            <img src={relatedProject.thumbnail} alt={relatedProject.title} />
                                        </div>
                                        <div className="related-info">
                                            <h3>{relatedProject.title}</h3>
                                            <p>{relatedProject.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CTA */}
                    <section className="content-section cta-section animate-on-scroll">
                        <div className="cta-card">
                            <h2>Want to build something similar?</h2>
                            <p>Let's discuss your project idea and bring it to life!</p>
                            <Link to="/#contact" className="btn-primary">
                                <span>Get In Touch</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProjectDetail;
