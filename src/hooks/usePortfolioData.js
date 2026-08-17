import { useState, useEffect, useCallback } from 'react';
import portfolioData from '../data/portfolioData.json';

const defaultHero = portfolioData.heroData || {
  title: "Product Engineer & Architect",
  greeting: "Hi, I'm Zain",
  description: "Engineering high-performance mobile products and web platforms from architecture to app store launch.",
  badge: "Available for new projects",
  avatarUrl: "/Profile.webp",
  statApps: 50,
  statYears: 3,
  statSatisfaction: 100
};

const defaultAbout = portfolioData.aboutData || {
  subtitle: "Passionate about building exceptional web & mobile experiences",
  introTitle: "Zain Saeed — Mobile & Full-Stack Product Engineer",
  introText: "Specialising in native Android (Kotlin/Jetpack Compose), Flutter cross-platform applications, and React web platforms.",
  techStack: [
    { name: "React", icon: "⚛️", color: "#61DAFB" },
    { name: "Next.js", icon: "▶️", color: "#ffffff" },
    { name: "Android", icon: "🤖", color: "#3DDC84" },
    { name: "Flutter", icon: "💙", color: "#02569B" },
    { name: "Node.js", icon: "🟢", color: "#339933" },
    { name: "Firebase", icon: "🔥", color: "#FFCA28" },
    { name: "TypeScript", icon: "📝", color: "#3178C6" },
    { name: "UI/UX", icon: "🎨", color: "#FF6B6B" }
  ]
};

const defaultSkills = portfolioData.skillsData || [];
const defaultContact = portfolioData.contactData || {
  email: "zain@zaincodes.dev",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA"
};
const defaultSocial = portfolioData.socialLinks || [];
const defaultProjects = portfolioData.portfolioProjects || [];

const getItem = (key, fallback) => {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
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

    const handleStorageChange = (e) => {
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
