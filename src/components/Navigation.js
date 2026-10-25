import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { downloadResume } from '../utils/resumeHelper';
import './Navigation.css';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark');
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isHomePage = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects' || location.pathname === '/showcase';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (isHomePage) {
        const sections = ['home', 'about', 'portfolio', 'skills', 'contact'];
        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsWorkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    localStorage.setItem('siteTheme', nextTheme);
    document.body.className = nextTheme === 'light' ? 'light-theme' : '';
    document.documentElement.className = nextTheme === 'light' ? 'light-theme' : '';
  };

  const scrollToSection = (sectionId) => {
    setIsWorkDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand" onClick={() => scrollToSection('home')}>
          <Logo showText={true} size="small" />
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Work / Projects with Submenu Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            ref={dropdownRef}
            onMouseEnter={() => setIsWorkDropdownOpen(true)}
            onMouseLeave={() => setIsWorkDropdownOpen(false)}
          >
            <button
              className={`nav-link nav-dropdown-trigger ${(activeSection === 'portfolio' && isHomePage) || isProjectsPage ? 'active' : ''}`}
              onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isWorkDropdownOpen}
            >
              <span>Work</span>
              <svg className={`chevron-icon ${isWorkDropdownOpen ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isWorkDropdownOpen && (
              <div className="nav-submenu-dropdown">
                <button
                  className="submenu-item"
                  onClick={() => scrollToSection('portfolio')}
                >
                  <span className="submenu-icon">📌</span>
                  <div className="submenu-text">
                    <strong>Featured Work</strong>
                    <small>Top Android &amp; Flutter apps</small>
                  </div>
                </button>

                <button
                  className="submenu-item"
                  onClick={() => {
                    setIsWorkDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                    navigate('/projects');
                  }}
                >
                  <span className="submenu-icon">🚀</span>
                  <div className="submenu-text">
                    <strong>All Projects Showcase</strong>
                    <small>Search &amp; browse case studies</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* About */}
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
            className={`nav-link ${activeSection === 'about' && isHomePage ? 'active' : ''}`}
          >
            About
          </a>

          {/* Skills / Expertise */}
          <a
            href="#skills"
            onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
            className={`nav-link ${activeSection === 'skills' && isHomePage ? 'active' : ''}`}
          >
            Expertise
          </a>

          {/* Quick Resume Download Pill */}
          <button
            onClick={() => {
              downloadResume();
              setIsMobileMenuOpen(false);
            }}
            className="nav-resume-btn"
            title="Download Zain Saeed Resume (PDF)"
            aria-label="Download Resume"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Resume</span>
          </button>

          {/* Get In Touch CTA */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
            className="nav-cta"
          >
            Get In Touch
          </a>

          {/* Dark / Light Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {currentTheme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
