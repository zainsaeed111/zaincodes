import React, { useEffect, useRef } from 'react';
import './Skills.css';

const Skills = () => {
  const skillsRef = useRef(null);

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

  const capabilities = [
    {
      id: 'mobile',
      title: 'Mobile Engineering',
      description: 'Native Android with Kotlin and Jetpack Compose. Cross-platform Flutter with BLoC architecture. React Native for rapid prototyping.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      )
    },
    {
      id: 'web',
      title: 'Web Platforms',
      description: 'React and Next.js applications with SSR/SSG, optimized hydration, and component design systems. TypeScript for type safety.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    },
    {
      id: 'backend',
      title: 'Backend Systems',
      description: 'Node.js and Express API networks. PostgreSQL and MongoDB with schema optimization. Firebase for auth, firestore, and cloud functions.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="5" rx="1"/>
          <rect x="2" y="10" width="20" height="5" rx="1"/>
          <rect x="2" y="17" width="20" height="5" rx="1"/>
          <circle cx="6" cy="5.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="6" cy="12.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="6" cy="19.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      )
    },
    {
      id: 'delivery',
      title: 'Product Delivery',
      description: 'CI/CD pipelines, automated testing, App Store and Google Play submission. Monitoring, crash reporting, and post-launch maintenance.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    }
  ];

  return (
    <section id="skills" className="skills-section" ref={skillsRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Full-Stack <span>Capabilities</span></h2>
          <p className="section-subtitle">
            Engineering capabilities across the complete product development lifecycle
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((cap, index) => (
            <div
              key={cap.id}
              className="capability-card"
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="capability-icon">
                {cap.icon}
              </div>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
