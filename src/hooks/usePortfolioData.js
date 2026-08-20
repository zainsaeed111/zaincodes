import { useState, useEffect, useCallback } from 'react';
import portfolioData from '../data/portfolioData.json';

const defaultHero = portfolioData.heroData;
const defaultAbout = portfolioData.aboutData;
const defaultSkills = portfolioData.skillsData;
const defaultContact = portfolioData.contactData;
const defaultSocial = portfolioData.socialLinks;
const defaultProjects = portfolioData.portfolioProjects;

const getItem = (key, fallback) => {
  try {
    const d = localStorage.getItem(key);
    if (!d) return fallback;
    const parsed = JSON.parse(d);
    
    // Auto-update localStorage if cached data is stale compared to latest resume data
    if (key === 'contactData' && parsed.email !== fallback.email) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'portfolioProjects' && parsed.length !== fallback.length) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'aboutData' && parsed.email !== fallback.email) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'heroData' && parsed.greeting !== fallback.greeting) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

export const usePortfolioData = () => {
  const [heroData, setHeroData] = useState(() => getItem('heroData', defaultHero));
  const [aboutData, setAboutData] = useState(() => getItem('aboutData', defaultAbout));
  const [skillsData, setSkillsData] = useState(() => getItem('skillsData', defaultSkills));
  const [contactData, setContactData] = useState(() => getItem('contactData', defaultContact));
  const [socialLinks, setSocialLinks] = useState(() => getItem('socialData', getItem('socialLinks', defaultSocial)));
  const [portfolioProjects, setPortfolioProjects] = useState(() => getItem('portfolioProjects', defaultProjects));
  const [resumeLink, setResumeLink] = useState(() => localStorage.getItem('resumeLink') || portfolioData.resumeLink || '');
  const [siteTheme, setSiteTheme] = useState(() => localStorage.getItem('siteTheme') || portfolioData.siteTheme || 'dark');

  const refreshData = useCallback(() => {
    setHeroData(getItem('heroData', defaultHero));
    setAboutData(getItem('aboutData', defaultAbout));
    setSkillsData(getItem('skillsData', defaultSkills));
    setContactData(getItem('contactData', defaultContact));
    setSocialLinks(getItem('socialData', getItem('socialLinks', defaultSocial)));
    setPortfolioProjects(getItem('portfolioProjects', defaultProjects));
    setResumeLink(localStorage.getItem('resumeLink') || portfolioData.resumeLink || '');
    setSiteTheme(localStorage.getItem('siteTheme') || portfolioData.siteTheme || 'dark');
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageChange = () => {
      refreshData();
    };

    const handleCustomSync = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolioDataUpdated', handleCustomSync);

    const timer = setInterval(() => {
      refreshData();
    }, 1200);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolioDataUpdated', handleCustomSync);
      clearInterval(timer);
    };
  }, [refreshData]);

  return {
    heroData,
    aboutData,
    skillsData,
    contactData,
    socialLinks,
    portfolioProjects,
    resumeLink,
    siteTheme,
    refreshData
  };
};

export default usePortfolioData;

