import React from 'react';
import Logo from './Logo';
import './Footer.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Footer = () => {
  const { socialLinks } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-narrow">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">High-performance mobile app engineering and web platform architecture.</p>
          </div>

          <div className="footer-nav-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }}>Home</a>
            <a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>Products</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>Philosophy</a>
            <a href="#skills" onClick={(e) => { e.preventDefault(); document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }); }}>Capabilities</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
          </div>

          {socialLinks && socialLinks.length > 0 && (
            <div className="footer-social-row">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="footer-social-link"
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          )}

          <div className="footer-copyright">
            <span>© {currentYear} ZainCodes. Engineered with React &amp; 3D Glass. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
