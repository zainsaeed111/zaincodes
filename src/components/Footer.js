import React from 'react';
import Logo from './Logo';
import './Footer.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Footer = () => {
  const { socialLinks, contactData } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-glow-bg" />
      <div className="container-max">
        <div className="footer-grid">
          {/* Brand Info Column */}
          <div className="footer-col footer-col-brand">
            <div className="footer-logo-wrapper" onClick={scrollToTop}>
              <Logo showText={true} size="large" />
            </div>
            <p className="footer-tagline">
              High-performance native Android (Kotlin/Java) &amp; Flutter (Dart) mobile application development, powered by robust REST API architecture.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>Available for Android &amp; Flutter Mobile Contracts</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => scrollTo('home')} className="footer-link-btn">Home</button></li>
              <li><button onClick={() => scrollTo('about')} className="footer-link-btn">About &amp; Experience</button></li>
              <li><button onClick={() => scrollTo('portfolio')} className="footer-link-btn">Featured Work</button></li>
              <li><button onClick={() => scrollTo('skills')} className="footer-link-btn">Tech Expertise</button></li>
              <li><button onClick={() => scrollTo('contact')} className="footer-link-btn">Get In Touch</button></li>
            </ul>
          </div>

          {/* Core Capabilities */}
          <div className="footer-col">
            <h4 className="footer-heading">Capabilities</h4>
            <ul className="footer-capabilities-list">
              <li>
                <span className="cap-icon">🤖</span>
                <span>Native Android (Kotlin/Java)</span>
              </li>
              <li>
                <span className="cap-icon">💙</span>
                <span>Flutter &amp; Dart Mobile</span>
              </li>
              <li>
                <span className="cap-icon">⚡</span>
                <span>Java Spring Boot REST APIs</span>
              </li>
              <li>
                <span className="cap-icon">⚛️</span>
                <span>Web Portals &amp; Admin Dashboards</span>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="footer-col">
            <h4 className="footer-heading">Connect</h4>
            {contactData && (
              <div className="footer-contact-info">
                <a href={`mailto:${contactData.email}`} className="footer-contact-item">
                  <span className="contact-icon">✉️</span>
                  <span>{contactData.email}</span>
                </a>
                <a href={`tel:${contactData.phone}`} className="footer-contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{contactData.phone}</span>
                </a>
                <div className="footer-contact-item">
                  <span className="contact-icon">📍</span>
                  <span>{contactData.location}</span>
                </div>
              </div>
            )}

            {socialLinks && socialLinks.length > 0 && (
              <div className="footer-social-grid">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="footer-social-badge"
                  >
                    <span className="social-icon">{s.icon}</span>
                    <span className="social-name">{s.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-text">
            © {currentYear} <span className="copyright-brand">ZainCodes</span> — Android &amp; Flutter Mobile Developer. All rights reserved.
          </div>
          <button onClick={scrollToTop} className="back-to-top-btn" aria-label="Back to top">
            <span>Back to top</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
