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

    const isMobileCategory = project ? (project.category === 'android' || project.category === 'flutter') : false;

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
        const text = `Check out this amazing ${project.title} case study by @ZainCodes!`;
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Back to All Projects Showcase</span>
                    </Link>

                    <div className="project-meta">
                        <span className="project-category-badge">
                            {project.category === 'android' ? '🤖 Android Native' : project.category === 'flutter' ? '💙 Flutter Mobile' : '🌐 Web Platform'}
                        </span>
                        {videoInfo && (
                            <span className="project-category-badge video-badge">
                                🎬 Video Demo Included
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
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="project-content" ref={contentRef}>
                <div className="container">

                    {/* ════════════════ INTERACTIVE STUDIO MEDIA CONSOLE ════════════════ */}
                    {(videoInfo || mediaList.length > 0) && (
                        <div className="media-showcase-console animate-on-scroll">
                            <div className="media-console-header">
                                <div className="media-console-tabs">
                                    {videoInfo && (
                                        <button
                                            className={`media-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('video')}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                            <span>Video Demo</span>
                                        </button>
                                    )}
                                    {mediaList.length > 0 && (
                                        <button
                                            className={`media-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('gallery')}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            <span>Screenshots &amp; Mockups ({mediaList.length})</span>
                                        </button>
                                    )}
                                </div>

                                {activeTab === 'gallery' && (
                                    <span className="media-counter-badge">
                                        Screenshot {activeImageIdx + 1} of {mediaList.length}
                                    </span>
                                )}
                            </div>

                            {/* Main Stage Display with Studio Mockup */}
                            <div className="media-stage-wrapper">
                                {activeTab === 'video' && videoInfo ? (
                                    <div className="video-player-container">
                                        {videoInfo.type === 'html5' ? (
                                            <video
                                                src={videoInfo.embedUrl}
                                                controls
                                                autoPlay
                                                muted
                                                loop
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
                                        )}
                                    </div>
                                ) : (
                                    activeImage && (
                                        <div
                                            className="stage-screenshot-container"
                                            onClick={() => setLightboxImage(activeImage.url)}
                                            title="Click to expand high-resolution view"
                                        >
                                            {/* Previous Navigation Arrow */}
                                            {mediaList.length > 1 && (
                                                <button
                                                    className="stage-nav-arrow prev"
                                                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                                    aria-label="Previous Screenshot"
                                                >
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="15 18 9 12 15 6"></polyline>
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Device Mockup Frame */}
                                            {isMobileCategory ? (
                                                <div className="device-mockup-phone">
                                                    <div className="phone-notch">
                                                        <span className="phone-speaker"></span>
                                                        <span className="phone-lens"></span>
                                                    </div>
                                                    <div className="phone-screen-viewport">
                                                        <img
                                                            src={activeImage.url}
                                                            alt={`${project.title} Preview`}
                                                            className="stage-screenshot-img phone-fit"
                                                            loading="eager"
                                                        />
                                                    </div>
                                                    <div className="phone-home-indicator"></div>
                                                </div>
                                            ) : (
                                                <div className="device-mockup-browser">
                                                    <div className="browser-header">
                                                        <div className="browser-dots">
                                                            <span className="dot dot-red"></span>
                                                            <span className="dot dot-yellow"></span>
                                                            <span className="dot dot-green"></span>
                                                        </div>
                                                        <div className="browser-address-bar">
                                                            <span className="lock-icon">🔒</span>
                                                            <span className="url-text">{project.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.app</span>
                                                        </div>
                                                    </div>
                                                    <div className="browser-viewport">
                                                        <img
                                                            src={activeImage.url}
                                                            alt={`${project.title} Preview`}
                                                            className="stage-screenshot-img web-fit"
                                                            loading="eager"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Next Navigation Arrow */}
                                            {mediaList.length > 1 && (
                                                <button
                                                    className="stage-nav-arrow next"
                                                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                                    aria-label="Next Screenshot"
                                                >
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="9 18 15 12 9 6"></polyline>
                                                    </svg>
                                                </button>
                                            )}

                                            <span className="zoom-hint-pill">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    <line x1="11" y1="8" x2="11" y2="14"></line>
                                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                                </svg>
                                                <span>Click to Expand Full-Res</span>
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Multi-Thumbnail Selector Strip */}
                            {mediaList.length > 1 && (
                                <div className="media-thumbnail-strip">
                                    {videoInfo && (
                                        <button
                                            className={`thumb-item-btn ${activeTab === 'video' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('video')}
                                            title="Watch Video Demo"
                                        >
                                            <img src={project.thumbnail || project.image || '/Profile.webp'} alt="Video Thumbnail" />
                                            <div className="thumb-video-badge">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
                                            <span className="thumb-num-badge">#{idx + 1}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════ SLEEK SOCIAL SHARE BAR ════════════════ */}
                    <div className="share-section animate-on-scroll">
                        <div className="share-bar-container">
                            <div className="share-bar-left">
                                <span className="share-pulse-dot"></span>
                                <span className="share-heading">Share this Case Study:</span>
                            </div>
                            <div className="share-buttons-group">
                                <button
                                    className={`share-pill-btn copy-btn ${copied ? 'copied' : ''}`}
                                    onClick={copyLink}
                                    title="Copy direct link to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            <span>Link Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>

                                <button className="share-pill-btn twitter-btn" onClick={shareOnTwitter} title="Share on Twitter / X">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                    <span>Twitter / X</span>
                                </button>

                                <button className="share-pill-btn linkedin-btn" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                    <span>LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ════════════════ CASE STUDY CHAPTERS ════════════════ */}
                    {/* 1. Overview */}
                    <section className="content-section card-case-study animate-on-scroll">
                        <div className="section-title-wrap">
                            <span className="section-step-num">01</span>
                            <h2 className="section-heading">About This Project</h2>
                        </div>
                        <p className="project-long-description">{project.longDescription || project.description}</p>
                    </section>

                    {/* 2. Problem Statement */}
                    {project.problem && (
                        <section className="content-section card-case-study card-challenge animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-badge-pill badge-danger">⚠️ The Challenge</span>
                            </div>
                            <p className="project-long-description">{project.problem}</p>
                        </section>
                    )}

                    {/* 3. Solution & Architecture */}
                    {project.solution && (
                        <section className="content-section card-case-study card-solution animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-badge-pill badge-success">💡 The Solution</span>
                            </div>
                            <p className="project-long-description">{project.solution}</p>
                        </section>
                    )}

                    {/* 4. Architecture */}
                    {project.architecture && (
                        <section className="content-section card-case-study card-architecture animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-badge-pill badge-cyan">⚡ System Architecture</span>
                            </div>
                            <p className="project-long-description">{project.architecture}</p>
                        </section>
                    )}

                    {/* 5. Technologies */}
                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <section className="content-section card-case-study animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-step-num">02</span>
                                <h2 className="section-heading">Technologies Used</h2>
                            </div>
                            <div className="tech-grid">
                                {project.technologies.map((tech, idx) => (
                                    <div key={idx} className="tech-item-badge">
                                        <span className="tech-dot" />
                                        <span className="tech-name">{tech}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 6. Key Features */}
                    {Array.isArray(project.features) && project.features.length > 0 && (
                        <section className="content-section card-case-study animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-step-num">03</span>
                                <h2 className="section-heading">Key Features &amp; Capabilities</h2>
                            </div>
                            <div className="features-grid">
                                {project.features.map((feature, idx) => (
                                    <div key={idx} className="feature-item-card">
                                        <div className="feature-icon-badge">✓</div>
                                        <div className="feature-text">{feature}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 7. Highlights */}
                    {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                        <section className="content-section card-case-study animate-on-scroll">
                            <div className="section-title-wrap">
                                <span className="section-step-num">04</span>
                                <h2 className="section-heading">Performance Highlights</h2>
                            </div>
                            <div className="highlights-grid">
                                {project.highlights.map((highlight, idx) => (
                                    <div key={idx} className="highlight-item-card">
                                        <div className="highlight-number-badge">{String(idx + 1).padStart(2, '0')}</div>
                                        <div className="highlight-text">{highlight}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 8. Related Projects */}
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
                                            <img src={relatedProject.thumbnail || relatedProject.image || '/Profile.webp'} alt={relatedProject.title} />
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

                    {/* 9. Final CTA */}
                    <section className="content-section cta-section animate-on-scroll">
                        <div className="cta-card">
                            <h2>Want to build something similar?</h2>
                            <p>Let's discuss your project architecture and bring your mobile or web app to production.</p>
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
                        <button className="lightbox-close-btn" onClick={() => setLightboxImage(null)} title="Close Lightbox">✕</button>
                        <img src={lightboxImage} alt="Expanded Screenshot" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
