import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const aboutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');

            const animateItems = entry.target.querySelectorAll('.animate-item');
            animateItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('visible');
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const techStack = [
    { name: "Android", icon: "🤖", color: "#3DDC84" },
    { name: "Kotlin", icon: "🎯", color: "#7F52FF" },
    { name: "Java", icon: "☕", color: "#F89820" },
    { name: "Flutter", icon: "💙", color: "#02569B" },
    { name: "React Native", icon: "⚛️", color: "#61DAFB" },
    { name: "Firebase", icon: "🔥", color: "#FFCA28" },
    { name: "Cloud", icon: "☁️", color: "#4285F4" },
    { name: "UI/UX", icon: "🎨", color: "#FF6B6B" }
  ];

  const detailItems = [
    {
      icon: "🎯",
      title: "Mission-Driven Development",
      description: "I believe in creating apps that not only meet requirements but exceed expectations."
    },
    {
      icon: "⚡",
      title: "Performance Optimization",
      description: "Every app I build is optimized for speed, efficiency, and smooth performance."
    },
    {
      icon: "🔧",
      title: "Full-Stack Approach",
      description: "From frontend UI/UX to backend integration, I handle every aspect with expertise."
    }
  ];

  const achievements = [
    { number: "50+", label: "Mobile Apps" },
    { number: "100%", label: "Satisfaction" },
    { number: "15+", label: "Play Store" },
    { number: "3+", label: "Years Exp" }
  ];

  return (
    <section id="about" className="about" ref={aboutRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">About <span>Me</span></h2>
          <p className="section-subtitle">Passionate about creating exceptional mobile experiences</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <div className="about-intro animate-item">
              <h3>Hello! I'm Zain, a dedicated mobile app developer</h3>
              <p>
                With over 3 years of experience in mobile development, I specialize in creating
                robust, scalable, and user-friendly applications for Android and cross-platform
                solutions.
              </p>
            </div>

            <div className="about-details">
              {detailItems.map((item, index) => (
                <div key={index} className="detail-item animate-item">
                  <div className="detail-icon">{item.icon}</div>
                  <div className="detail-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-visual">
            <div className="tech-stack animate-item">
              <h4>Technologies I Love</h4>
              <div className="tech-grid">
                {techStack.map((tech, index) => (
                  <div
                    key={index}
                    className="tech-card"
                    style={{ '--tech-color': tech.color }}
                  >
                    <span className="tech-emoji">{tech.icon}</span>
                    <span className="tech-name">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="achievements animate-item">
              <h4>Key Achievements</h4>
              <div className="achievement-grid">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-number">{achievement.number}</div>
                    <div className="achievement-text">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="about-cta animate-item">
          <p>Ready to bring your mobile app idea to life?</p>
          <button
            className="btn-primary"
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
          >
            <span>Let's Work Together</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
