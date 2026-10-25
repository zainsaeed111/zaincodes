import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProjectDetail.css';
import { getVideoEmbedInfo, normalizeScreenshots } from '../utils/mediaHelper';

const ProjectDetail = ({ projects }) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const contentRef = useRef(null);

    const project = (projects || []).find(p => p.slug === slug);

    // Media states
    const videoInfo = useMemo(() => {
        if (!project) return null;
        return getVideoEmbedInfo(project.videoUrl || project.videoLink || project.demoVideo);
    }, [project]);

    const mediaList = useMemo(() => {
        if (!project) return [];
        const list = [];
        // 1. Cover
        const cover = project.thumbnail || project.image;
        if (cover) list.push({ type: 'image', url: cover, label: 'Cover' });

        // 2. Extra screenshots
        const extra = normalizeScreenshots(project.screenshots);
        extra.forEach((url, i) => {
            if (url !== cover) {
                list.push({ type: 'image', url, label: `Screen ${i + 1}` });
            }
        });

        return list;
    }, [project]);

    // Default to video if available, else first screenshot
    const [activeTab, setActiveTab] = useState('video'); // 'video' | 'gallery'
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        if (!project) {
            navigate('/');
        } else {
            document.title = `${project.title} | Zain Saeed Case Study`;
            setTimeout(() => setIsVisible(true), 100);
            if (!videoInfo && mediaList.length > 0) {
                setActiveTab('gallery');
            } else if (videoInfo) {
                setActiveTab('video');
            }
        }

        return () => {
            document.title = "Zain Saeed | Mobile App & Full-Stack Developer";
        };
    }, [project, navigate, videoInfo, mediaList]);

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

    const relatedProjects = (projects || [])
        .filter(p => p.category === project.category && p.id !== project.id)
        .slice(0, 2);

    const isValidLink = (link) => link && typeof link === 'string' && link.trim() !== '' && link.trim() !== '#';

    const handlePrevImage = () => {
        if (mediaList.length === 0) return;
        setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
        setActiveTab('gallery');
    };

    const handleNextImage = () => {
        if (mediaList.length === 0) return;
        setActiveImageIdx((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
        setActiveTab('gallery');
    };

    const activeImage = mediaList[activeImageIdx] || mediaList[0];

    return (
        <div className={`project-detail ${isVisible ? 'visible' : ''}`}>
            {/* Hero Section */}
            <section className="project-hero">
                <div className="hero-background">
                    <img src={project.image || project.thumbnail || '/Profile.webp'} alt={project.title} className="hero-bg-image" />
                    <div className="hero-overlay"></div>
                </div>
                <div className="container hero-content">
                    <Link to="/projects" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Projects Showcase
                    </Link>
                    <div className="project-meta">
                        <span className="project-category-badge">
                            {project.category === 'android' ? '🤖 Android Native' : project.category === 'flutter' ? '💙 Flutter Mobile' : '🌐 Web Platform'}
                        </span>
                        {videoInfo && (
                            <span className="project-category-badge" style={{ marginLeft: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}>
                                🎬 Video Demo Attached
                            </span>
                        )}
                    </div>
                    <h1 className="project-title">{project.title}</h1>
                    <p className="project-tagline">{project.description}</p>

                    <div className="project-actions">
                        {isValidLink(project.liveLink) && (
                            <a href={project.liveLink} className="btn-primary" target="_blank" rel="noopener noreferrer">
                                <span>{project.category === 'web' ? 'View Live Demo' : 'View Application'}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                            </a>
                        )}
                        {project.category !== 'web' && isValidLink(project.playStoreLink) && (
                            <a href={project.playStoreLink} className="btn-primary" target="_blank" rel="noopener noreferrer">
                                <span>View on Play Store</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                            </a>
                        )}
                        {isValidLink(project.githubLink) && (
                            <a href={project.githubLink} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                                <span>View Source Code</span>
                            </a>
                        )}
                        <button className={`btn-secondary ${copied ? 'copied' : ''}`} onClick={copyLink}>
                            <span>{copied ? '✓ Link Copied' : '🔗 Share Direct Link'}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="project-content" ref={contentRef}>
                <div className="container">

                    {/* ════════════════ INTERACTIVE MEDIA & VIDEO CONSOLE ════════════════ */}
                    {(videoInfo || mediaList.length > 0) && (
                        <div className="media-showcase-console animate-on-scroll">
                            <div className="media-console-header">
                                <div className="media-console-tabs">
                                    {videoInfo && (
                                        <button
                                            className={`media-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('video')}
                                        >
                                            <span>▶ Video Demo</span>
                                        </button>
                                    )}
                                    {mediaList.length > 0 && (
                                        <button
                                            className={`media-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('gallery')}
                                        >
                                            <span>📸 Screenshots &amp; Mockups ({mediaList.length})</span>
                                        </button>
                                    )}
                                </div>

                                {activeTab === 'gallery' && (
                                    <span className="media-counter-badge">
                                        Slide {activeImageIdx + 1} of {mediaList.length}
                                    </span>
                                )}
                            </div>

                            {/* Main Stage Display */}
                            <div className="media-stage-wrapper">
                                {activeTab === 'video' && videoInfo ? (
                                    videoInfo.type === 'html5' ? (
                                        <video
                                            src={videoInfo.embedUrl}
                                            controls
                                            playsInline
                                            className="html5-video-player"
                                        />
                                    ) : (
                                        <iframe
                                            src={videoInfo.embedUrl}
                                            title={`${project.title} Video Showcase`}
                                            className="video-responsive-frame"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    )
                                ) : (
                                    activeImage && (
                                        <div
                                            className="stage-screenshot-container"
                                            onClick={() => setLightboxImage(activeImage.url)}
                                            title="Click to view full screen"
                                        >
                                            {mediaList.length > 1 && (
                                                <>
                                                    <button
                                                        className="stage-nav-arrow prev"
                                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                                        aria-label="Previous Screenshot"
                                                    >
                                                        ‹
                                                    </button>
                                                    <button
                                                        className="stage-nav-arrow next"
                                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                                        aria-label="Next Screenshot"
                                                    >
                                                        ›
                                                    </button>
                                                </>
                                            )}
                                            <img
                                                src={activeImage.url}
                                                alt={`${project.title} Preview`}
                                                className="stage-screenshot-img"
                                                loading="eager"
                                            />
                                            <span className="zoom-hint-pill">🔍 Click to Expand High-Res</span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Multi-Thumbnail Selector Strip */}
                            <div className="media-thumbnail-strip">
                                {videoInfo && (
                                    <button
                                        className={`thumb-item-btn ${activeTab === 'video' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('video')}
                                        title="Watch Video Demo"
                                    >
                                        <img src={project.thumbnail || project.image || '/logo192.png'} alt="Video Thumbnail" />
                                        <div className="thumb-video-badge">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                            <span>Video</span>
                                        </div>
                                    </button>
                                )}

                                {mediaList.map((item, idx) => (
                                    <button
                                        key={idx}
                                        className={`thumb-item-btn ${activeTab === 'gallery' && activeImageIdx === idx ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('gallery');
                                            setActiveImageIdx(idx);
                                        }}
                                        title={`View ${item.label}`}
                                    >
                                        <img src={item.url} alt={`Thumbnail ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share Section */}
                    <div className="share-section animate-on-scroll">
                        <span className="share-label">Share this case study:</span>
                        <div className="share-buttons">
                            <button
                                className={`share-btn ${copied ? 'copied' : ''}`}
                                onClick={copyLink}
                                title="Copy direct link"
                            >
                                {copied ? '✓ Copied!' : '📋 Copy Link'}
                            </button>
                            <button className="share-btn twitter" onClick={shareOnTwitter} title="Share on Twitter">
                                Twitter / X
                            </button>
                            <button className="share-btn linkedin" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                                LinkedIn
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <section className="content-section animate-on-scroll">
                        <h2 className="section-heading">About This Project</h2>
                        <p className="project-long-description">{project.longDescription || project.description}</p>
                    </section>

                    {/* The Problem */}
                    {project.problem && (
                        <section className="content-section animate-on-scroll">
                            <h2 className="section-heading">The Challenge</h2>
                            <p className="project-long-description">{project.problem}</p>
                        </section>
                    )}

                    {/* The Solution */}
                    {project.solution && (
                        <section className="content-section animate-on-scroll">
                            <h2 className="section-heading">The Solution</h2>
                            <p className="project-long-description">{project.solution}</p>
                        </section>
                    )}

                    {/* System Architecture */}
                    {project.architecture && (
                        <section className="content-section animate-on-scroll">
                            <h2 className="section-heading">System Architecture</h2>
                            <p className="project-long-description">{project.architecture}</p>
                        </section>
                    )}

                    {/* Technologies */}
                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
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
                    )}

                    {/* Features */}
                    {Array.isArray(project.features) && project.features.length > 0 && (
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
                    )}

                    {/* Highlights */}
                    {Array.isArray(project.highlights) && project.highlights.length > 0 && (
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
                    )}

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
                                            <img src={relatedProject.thumbnail || relatedProject.image || '/logo192.png'} alt={relatedProject.title} />
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

            {/* Lightbox Fullscreen Modal */}
            {lightboxImage && (
                <div className="media-lightbox-modal" onClick={() => setLightboxImage(null)}>
                    <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close-btn" onClick={() => setLightboxImage(null)}>✕</button>
                        <img src={lightboxImage} alt="Expanded Screenshot" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
