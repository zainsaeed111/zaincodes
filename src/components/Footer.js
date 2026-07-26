import React from 'react';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">Product engineering for web and mobile.</p>
          </div>
          <div className="footer-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); document.getElementById('home').scrollIntoView({ behavior: 'smooth' }); }}>Home</a>
            <a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' }); }}>Work</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about').scrollIntoView({ behavior: 'smooth' }); }}>About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">© {currentYear} ZainCodes. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
