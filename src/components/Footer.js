import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/zaincodes' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/zaincodes' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/zaincodes' },
    { name: 'Dribbble', icon: '🏀', url: 'https://dribbble.com/zaincodes' }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-text">ZainCodes</span>
              <span className="logo-dot">.</span>
            </div>
            <p className="footer-description">
              Full-stack mobile application developer specializing in Android and Flutter. 
              Creating exceptional mobile experiences that make a difference.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social.name}
                >
                  <span className="social-icon">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href.substring(1));
                    }}
                    className="footer-link"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul className="footer-links">
              <li><span className="footer-text">Android App Development</span></li>
              <li><span className="footer-text">Flutter Development</span></li>
              <li><span className="footer-text">UI/UX Design</span></li>
              <li><span className="footer-text">App Maintenance</span></li>
              <li><span className="footer-text">Consulting</span></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>zain@zaincodes.dev</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} ZainCodes. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy" className="footer-bottom-link">Privacy Policy</a>
              <a href="#terms" className="footer-bottom-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-background">
        <div className="footer-orb orb-1"></div>
        <div className="footer-orb orb-2"></div>
        <div className="footer-orb orb-3"></div>
      </div>
    </footer>
  );
};

export default Footer;
