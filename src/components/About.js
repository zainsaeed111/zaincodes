import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const aboutRef = useRef(null);

  // Load about data from localStorage (set via Admin Panel)
  const aboutData = (() => {
    try {
      const d = localStorage.getItem('aboutData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

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

  const techStack = aboutData?.techStack || [
    { name: "React", icon: "⚛️", color: "#61DAFB" },
    { name: "Next.js", icon: "▶️", color: "#ffffff" },
    { name: "Android", icon: "🤖", color: "#3DDC84" },
    { name: "Flutter", icon: "💙", color: "#02569B" },
    { name: "Node.js", icon: "🟢", color: "#339933" },
    { name: "Firebase", icon: "🔥", color: "#FFCA28" },
    { name: "TypeScript", icon: "📝", color: "#3178C6" },
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
          <p className="section-subtitle">{aboutData?.subtitle || 'Passionate about building exceptional web & mobile experiences'}</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <div className="about-intro animate-item">
              <h3>{aboutData?.introTitle || "Hello! I'm Zain, a Full-Stack Developer"}</h3>
              <p>
                {aboutData?.introText || "With over 3 years of experience in web and mobile development, I specialize in building robust, scalable applications using React, Next.js, Android (Kotlin/Java) and Flutter — from pixel-perfect frontends to production-ready backends."}
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
