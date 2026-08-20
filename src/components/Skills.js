import React, { useState, useEffect, useRef } from 'react';
import './Skills.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Skills = () => {
  const { skillsData } = usePortfolioData();
  const skillsRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');

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

    if (skillsRef.current) observer.observe(skillsRef.current);
    return () => observer.disconnect();
  }, []);

  // Featured Major Stack (Android/Kotlin, Flutter/Dart, Java Spring Boot)
  const majorSkills = [
    {
      id: 'android-kotlin',
      name: 'Android Development',
      techs: 'Kotlin & Java',
      level: '96%',
      badge: 'Core Specialization',
      color: '#3DDC84',
      bgGlow: 'rgba(61, 220, 132, 0.15)',
      description: 'Native Android architecture utilizing Clean Code, MVVM, Jetpack Compose, Room DB, WorkManager, Coroutines & Flow.',
      highlights: ['Jetpack Compose & XML', 'Clean Architecture & MVVM', 'Offline-First Sync Engine', 'Play Store Deployment'],
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
          <path d="M8 6h8"/>
        </svg>
      )
    },
    {
      id: 'flutter-dart',
      name: 'Flutter & Dart',
      techs: 'Cross-Platform Framework',
      level: '92%',
      badge: 'Cross-Platform Core',
      color: '#02569B',
      bgGlow: 'rgba(2, 86, 155, 0.18)',
      description: 'Fluid, high-performance cross-platform mobile apps with BLoC state management, native channel bridges & pixel-perfect UI.',
      highlights: ['BLoC & Provider State', 'Native Method Channels', 'Custom UI Animations', 'iOS & Android Dual Release'],
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12l5 5 13-13H12z"/>
          <path d="M7 17l5 5h8l-8-8-5 3z"/>
        </svg>
      )
    },
    {
      id: 'spring-boot',
      name: 'Java Spring Boot',
      techs: 'Enterprise Backend',
      level: '90%',
      badge: 'Backend Architecture',
      color: '#6DB33F',
      bgGlow: 'rgba(109, 179, 63, 0.18)',
      description: 'Enterprise RESTful web services, Spring Security, Hibernate/JPA, microservices, and high-concurrency database management.',
      highlights: ['RESTful API Engineering', 'Spring Security & JWT', 'PostgreSQL & JPA/Hibernate', 'Microservices Architecture'],
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      )
    }
  ];

  // Fallback skills list if skillsData is empty or updated
  const allSkillsList = [
    { name: 'Android (Kotlin)', level: 96, category: 'mobile', isMajor: true, color: '#3DDC84', icon: '🤖', desc: 'Native Android apps, MVVM, Compose & Room DB.' },
    { name: 'Flutter & Dart', level: 92, category: 'mobile', isMajor: true, color: '#2196F3', icon: '💙', desc: 'Cross-platform apps with BLoC & 60FPS UI.' },
    { name: 'Java Spring Boot', level: 90, category: 'backend', isMajor: true, color: '#6DB33F', icon: '⚡', desc: 'Enterprise REST APIs, Spring Security & PostgreSQL.' },
    { name: 'Android (Java)', level: 90, category: 'mobile', isMajor: false, color: '#F57C00', icon: '☕', desc: 'Core Java Android SDK, services & legacy refactoring.' },
    { name: 'React & Next.js', level: 88, category: 'web', isMajor: false, color: '#61DAFB', icon: '⚛️', desc: 'Modern SSR/SSG web interfaces & component systems.' },
    { name: 'Node.js & Express', level: 85, category: 'backend', isMajor: false, color: '#339933', icon: '🟢', desc: 'Event-driven APIs, WebSockets & serverless routes.' },
    { name: 'WordPress', level: 82, category: 'web', isMajor: false, color: '#21759B', icon: '📰', desc: 'Custom theme integration, CMS setup & optimization.' },
    { name: 'VS Code & Cursor AI', level: 95, category: 'tools', isMajor: false, color: '#007ACC', icon: '💻', desc: 'AI-assisted rapid prototyping & code refinement.' },
    { name: 'Git & GitHub', level: 92, category: 'tools', isMajor: false, color: '#F05032', icon: '🐙', desc: 'Version control, PR workflows & CI/CD automation.' },
    { name: 'Firebase & REST APIs', level: 92, category: 'backend', isMajor: false, color: '#FFA000', icon: '🔥', desc: 'Realtime database, Cloud Messaging & OAuth.' },
    { name: 'HTML5 & CSS3', level: 94, category: 'web', isMajor: false, color: '#E34F26', icon: '🎨', desc: 'Responsive glassmorphism design & animations.' }
  ];

  // Helper to extract skills array from custom hooks or default
  const getSkillsToDisplay = () => {
    if (skillsData && skillsData.length > 0) {
      let combined = [];
      skillsData.forEach(cat => {
        cat.skills.forEach(s => {
          combined.push({
            ...s,
            category: cat.category || 'other',
            icon: cat.icon || '⚡'
          });
        });
      });
      return combined;
    }
    return allSkillsList;
  };

  const currentSkills = getSkillsToDisplay();

  const filteredSkills = currentSkills.filter(skill => {
    if (activeTab === 'all') return true;
    if (activeTab === 'major') {
      const name = skill.name.toLowerCase();
      return skill.isMajor || 
             name.includes('kotlin') || 
             name.includes('flutter') || 
             name.includes('spring') || 
             name.includes('dart') || 
             (name.includes('android') && name.includes('kotlin'));
    }
    if (activeTab === 'mobile') return skill.category === 'mobile' || skill.name.toLowerCase().includes('android') || skill.name.toLowerCase().includes('flutter') || skill.name.toLowerCase().includes('dart');
    if (activeTab === 'backend') return skill.category === 'backend' || skill.name.toLowerCase().includes('spring') || skill.name.toLowerCase().includes('node') || skill.name.toLowerCase().includes('firebase');
    if (activeTab === 'web') return skill.category === 'web' || skill.name.toLowerCase().includes('react') || skill.name.toLowerCase().includes('wordpress') || skill.name.toLowerCase().includes('html');
    if (activeTab === 'tools') return skill.category === 'tools' || skill.name.toLowerCase().includes('code') || skill.name.toLowerCase().includes('cursor') || skill.name.toLowerCase().includes('git');
    return true;
  });

  return (
    <section id="skills" className="skills-section" ref={skillsRef}>
      <div className="container-narrow">
        
        {/* ── Section Title & Tagline ── */}
        <div className="section-header text-center">
          <span className="section-badge">Engineering Matrix</span>
          <h2 className="section-title">
            Technical <span className="text-gradient">Arsenal</span> & Core Stack
          </h2>
          <p className="section-subtitle">
            Specialized in high-performance Mobile Engineering (Android & Flutter) and Enterprise Backend Systems (Java Spring Boot), supported by modern Web & AI Developer tools.
          </p>
        </div>

        {/* ── Spotlight / Major Skills Cards (Featured View) ── */}
        <div className="major-skills-spotlight">
          <div className="spotlight-header">
            <div className="spotlight-title-group">
              <span className="glowing-dot"></span>
              <h3>Primary Tech Focus & Expertise</h3>
            </div>
            <span className="spotlight-subtitle">Featured Pillars</span>
          </div>

          <div className="major-cards-grid">
            {majorSkills.map((item) => (
              <div key={item.id} className="major-card glass-card hover-glow" style={{ '--glow-color': item.color }}>
                <div className="major-card-badge" style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}15` }}>
                  {item.badge}
                </div>
                
                <div className="major-card-header">
                  <div className="major-icon" style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}40` }}>
                    {item.icon}
                  </div>
                  <div className="major-titles">
                    <h4>{item.name}</h4>
                    <span className="major-tech-sub">{item.techs}</span>
                  </div>
                  <div className="major-level-pill" style={{ color: item.color }}>
                    {item.level}
                  </div>
                </div>

                <p className="major-desc">{item.description}</p>

                <div className="major-highlights">
                  {item.highlights.map((h, i) => (
                    <span key={i} className="highlight-chip">
                      <span className="chip-bullet" style={{ background: item.color }}></span>
                      {h}
                    </span>
                  ))}
                </div>

                <div className="major-progress-bg">
                  <div className="major-progress-fill" style={{ width: item.level, background: `linear-gradient(90deg, ${item.color}, #06b6d4)` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skill Filtering Tabs ── */}
        <div className="skills-filter-container">
          <div className="filter-tabs">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Technologies
            </button>
            <button className={`tab-btn ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
              ⭐ Major Stack
            </button>
            <button className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`} onClick={() => setActiveTab('mobile')}>
              📱 Mobile
            </button>
            <button className={`tab-btn ${activeTab === 'backend' ? 'active' : ''}`} onClick={() => setActiveTab('backend')}>
              ⚡ Backend
            </button>
            <button className={`tab-btn ${activeTab === 'web' ? 'active' : ''}`} onClick={() => setActiveTab('web')}>
              🌐 Web
            </button>
            <button className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
              🛠️ Tools & AI
            </button>
          </div>
        </div>

        {/* ── Categorized Skills Grid ── */}
        <div className="skills-grid">
          {filteredSkills.map((skill, index) => {
            const isMajorSkill = skill.isMajor || 
              skill.name.toLowerCase().includes('kotlin') || 
              skill.name.toLowerCase().includes('flutter') || 
              skill.name.toLowerCase().includes('spring') || 
              skill.name.toLowerCase().includes('dart');
            return (
              <div 
                key={index} 
                className={`skill-card glass-card ${isMajorSkill ? 'featured-skill' : ''}`}
                style={{ '--item-accent': skill.color || '#6366f1' }}
              >
                <div className="skill-card-top">
                  <div className="skill-title-wrapper">
                    <span className="skill-icon-emoji">{skill.icon || (isMajorSkill ? '🔥' : '⚙️')}</span>
                    <div>
                      <h4 className="skill-card-name">
                        {skill.name}
                        {isMajorSkill && <span className="major-star" title="Core Major Skill">★ Major</span>}
                      </h4>
                    </div>
                  </div>
                  <span className="skill-level-number">{skill.level}%</span>
                </div>

              {skill.desc && <p className="skill-card-desc">{skill.desc}</p>}

              <div className="skill-meter-track">
                <div 
                  className="skill-meter-fill"
                  style={{ 
                    width: `${skill.level}%`, 
                    background: `linear-gradient(90deg, ${skill.color || '#6366f1'}, #06b6d4)` 
                  }}
                />
              </div>
            </div>
          );
        })}
        </div>

      </div>
    </section>
  );
};

export default Skills;

