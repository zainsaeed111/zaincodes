import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectDetail from './components/ProjectDetail';
import portfolioData from './data/portfolioData.json';
import { fetchLatestGitHubData } from './utils/githubSync';

const AdminPanel = React.lazy(() => import('./components/AdminPanel'));

// Default projects data removed to clean up code and fix ESLint warning

const getProjects = () => {
  const savedProjects = localStorage.getItem('portfolioProjects');
  if (savedProjects) {
    const parsed = JSON.parse(savedProjects);
    if (parsed.length > 0) return parsed;
  }
  return portfolioData.portfolioProjects;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Home page component
const HomePage = ({ projects }) => {
  return (
    <>
      <Hero />
      <About />
      <Portfolio projects={projects} />
      <Skills />
      <Contact />
    </>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [projects, setProjects] = useState(getProjects());

  /* Global Data Initialization */
  useEffect(() => {
    const initializeData = async () => {
      // 1. Initially populate from built-in JSON if localStorage is empty
      const keys = [
        { key: 'heroData', data: portfolioData.heroData },
        { key: 'aboutData', data: portfolioData.aboutData },
        { key: 'skillsData', data: portfolioData.skillsData },
        { key: 'contactData', data: portfolioData.contactData },
        { key: 'socialLinks', data: portfolioData.socialLinks },
        { key: 'portfolioProjects', data: portfolioData.portfolioProjects },
        { key: 'resumeLink', data: portfolioData.resumeLink },
        { key: 'siteTheme', data: portfolioData.siteTheme || 'dark' }
      ];

      keys.forEach(({ key, data }) => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      // 2. Proactively fetch latest data from GitHub for "Real-Time" feel
      try {
        const latestData = await fetchLatestGitHubData();
        if (latestData) {
          const mapping = {
            heroData: latestData.heroData,
            aboutData: latestData.aboutData,
            skillsData: latestData.skillsData,
            contactData: latestData.contactData,
            socialLinks: latestData.socialLinks,
            portfolioProjects: latestData.portfolioProjects,
            resumeLink: latestData.resumeLink,
            siteTheme: latestData.siteTheme
          };

          Object.entries(mapping).forEach(([key, val]) => {
            if (val) localStorage.setItem(key, JSON.stringify(val));
          });

          // Update projects state immediately if it changed
          if (latestData.portfolioProjects) {
            setProjects(latestData.portfolioProjects);
          }
        }
      } catch (err) {
        console.warn('Real-time sync notice:', err.message);
      }

      setIsLoading(false);
    };

    initializeData();
  }, []);

  /* Theme state and application */
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('siteTheme') || 'dark';
      document.body.className = savedTheme === 'light' ? 'light-theme' : '';
    };

    applyTheme();

    // Listen for theme changes from other tabs (Admin)
    const handleThemeChange = (e) => {
      if (e.key === 'siteTheme') applyTheme();
    };
    window.addEventListener('storage', handleThemeChange);

    // Also check for same-tab updates
    const themeSync = setInterval(() => {
      const savedTheme = localStorage.getItem('siteTheme') || 'dark';
      const isCurrentlyLight = document.body.classList.contains('light-theme');
      if (savedTheme === 'light' && !isCurrentlyLight) applyTheme();
      if (savedTheme === 'dark' && isCurrentlyLight) applyTheme();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(themeSync);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Listen for storage changes (when admin updates projects)
  useEffect(() => {
    const handleStorageChange = () => {
      setProjects(getProjects());
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for same-tab updates
    const interval = setInterval(() => {
      const current = JSON.stringify(projects);
      const saved = localStorage.getItem('portfolioProjects');
      if (saved && saved !== current) {
        setProjects(JSON.parse(saved));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [projects]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>ZainCodes</h2>
        <p>Loading amazing digital experiences...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Routes>
          {/* Admin Route - No Navigation/Footer */}
          <Route path="/admin" element={
            <Suspense fallback={
              <div className="loading-screen">
                <div className="loading-spinner"></div>
                <h2>ZainCodes</h2>
                <p>Loading Admin Dashboard...</p>
              </div>
            }>
              <AdminPanel />
            </Suspense>
          } />

          {/* Main Site Routes */}
          <Route path="/*" element={
            <>
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage projects={projects} />} />
                  <Route path="/portfolio/:slug" element={<ProjectDetail projects={projects} />} />
                </Routes>
              </main>
              <Footer />
              <button
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
              >
                ↑
              </button>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
