import React, { useState, useEffect } from 'react';
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
import AdminPanel from './components/AdminPanel';

// Default projects data (used if no admin data exists)
const defaultProjects = [
  {
    id: 1,
    slug: "e-commerce-mobile-app",
    title: "E-Commerce Mobile App",
    category: "android",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    description: "A comprehensive e-commerce solution built with Kotlin and Android Architecture Components.",
    longDescription: "This full-featured e-commerce application revolutionizes mobile shopping with its intuitive interface and robust architecture.",
    technologies: ["Kotlin", "Android", "Room Database", "Retrofit", "MVVM"],
    features: ["User Authentication", "Product Catalog", "Shopping Cart", "Payment Integration", "Order Tracking"],
    highlights: ["50,000+ downloads", "4.8 star rating", "99.9% crash-free"],
    playStoreLink: "#",
    githubLink: "#"
  },
  {
    id: 2,
    slug: "fitness-tracker",
    title: "Fitness Tracker",
    category: "flutter",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    description: "Cross-platform fitness tracking app with real-time data synchronization and analytics.",
    longDescription: "A comprehensive fitness companion that helps users achieve their health goals through personalized workout plans.",
    technologies: ["Flutter", "Dart", "Firebase", "Bloc Pattern", "Charts"],
    features: ["Workout Tracking", "Progress Analytics", "Social Features", "Wearable Integration"],
    highlights: ["Cross-platform", "Real-time sync", "10+ wearables"],
    playStoreLink: "#",
    githubLink: "#"
  },
  {
    id: 3,
    slug: "banking-app",
    title: "Banking App",
    category: "android",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    description: "Secure banking application with biometric authentication and real-time transaction monitoring.",
    longDescription: "An enterprise-grade mobile banking solution designed with security as the top priority.",
    technologies: ["Java", "Android", "Biometric API", "Encryption", "REST API"],
    features: ["Biometric Login", "Account Management", "Transfer Money", "Transaction History"],
    highlights: ["Bank-level security", "PCI DSS compliant", "Zero breaches"],
    playStoreLink: "#",
    githubLink: "#"
  },
  {
    id: 4,
    slug: "saas-analytics-dashboard",
    title: "SaaS Analytics Dashboard",
    category: "web",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    description: "Real-time analytics dashboard for SaaS businesses with interactive charts and data visualizations.",
    longDescription: "A modern, full-stack analytics platform built with Next.js and PostgreSQL, featuring real-time data pipelines and interactive D3.js visualizations.",
    technologies: ["React", "Next.js", "TypeScript", "PostgreSQL", "D3.js", "Tailwind CSS"],
    features: ["Real-time Analytics", "Custom Reports", "Team Collaboration", "API Integrations", "Export to PDF"],
    highlights: ["Sub-200ms load time", "10K+ daily active users", "99.99% uptime"],
    playStoreLink: "#",
    githubLink: "#"
  },
  {
    id: 5,
    slug: "ai-content-platform",
    title: "AI Content Platform",
    category: "web",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    description: "AI-powered content management system with automated SEO optimization and multi-language support.",
    longDescription: "A next-generation CMS powered by GPT APIs, allowing marketers to generate, optimize and schedule content across multiple channels.",
    technologies: ["React", "Node.js", "MongoDB", "OpenAI API", "Redis", "Docker"],
    features: ["AI Content Generation", "SEO Auto-Optimization", "Multi-Language", "Scheduling", "Analytics"],
    highlights: ["80% faster content creation", "40% SEO improvement", "5-star user rating"],
    playStoreLink: "#",
    githubLink: "#",
    liveLink: "#"
  }
];

const getProjects = () => {
  const savedProjects = localStorage.getItem('portfolioProjects');
  if (savedProjects) {
    const parsed = JSON.parse(savedProjects);
    if (parsed.length > 0) return parsed;
  }
  return [defaultProjects[0]];
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
          <Route path="/admin" element={<AdminPanel />} />

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
