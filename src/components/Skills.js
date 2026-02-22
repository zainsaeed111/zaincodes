import React, { useEffect, useRef } from 'react';
import './Skills.css';

const Skills = () => {
  const skillsRef = useRef(null);

  // Load skills data from localStorage (set via Admin Panel)
  const savedSkills = (() => {
    try {
      const d = localStorage.getItem('skillsData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const skillCategories = savedSkills || [
    {
      title: "Web Development",
      icon: "🌐",
      skills: [
        { name: "React / Next.js", level: 92, color: "#61DAFB" },
        { name: "TypeScript", level: 88, color: "#3178C6" },
        { name: "HTML / CSS", level: 95, color: "#E34F26" },
        { name: "Tailwind CSS", level: 85, color: "#06B6D4" },
        { name: "Node.js", level: 85, color: "#339933" }
      ]
    },
    {
      title: "Mobile Development",
      icon: "📱",
      skills: [
        { name: "Android (Kotlin)", level: 95, color: "#3DDC84" },
        { name: "Android (Java)", level: 90, color: "#F57C00" },
        { name: "Flutter", level: 88, color: "#2196F3" },
        { name: "React Native", level: 75, color: "#61DAFB" },
        { name: "iOS (Swift)", level: 70, color: "#007AFF" }
      ]
    },
    {
      title: "Backend & Database",
      icon: "⚙️",
      skills: [
        { name: "Firebase", level: 92, color: "#FFA000" },
        { name: "PostgreSQL", level: 85, color: "#336791" },
        { name: "REST APIs", level: 90, color: "#FF6B6B" },
        { name: "MongoDB", level: 80, color: "#47A248" },
        { name: "Docker", level: 75, color: "#2496ED" }
      ]
    },
    {
      title: "Tools & Design",
      icon: "🎨",
      skills: [
        { name: "Git / GitHub", level: 90, color: "#F05032" },
        { name: "Figma", level: 85, color: "#F24E1E" },
        { name: "VS Code", level: 88, color: "#007ACC" },
        { name: "CI/CD", level: 80, color: "#FF6B35" },
        { name: "Material Design", level: 95, color: "#00C9A7" }
      ]
    }
  ];

  const achievements = [
    {
      title: "Google Play Store",
      description: "15+ published apps",
      icon: "🏆",
      color: "#4CAF50"
    },
    {
      title: "Client Satisfaction",
      description: "100% positive feedback",
      icon: "⭐",
      color: "#FF9800"
    },
    {
      title: "Code Quality",
      description: "Clean, maintainable code",
      icon: "💎",
      color: "#2196F3"
    },
    {
      title: "Performance",
      description: "Optimized for speed",
      icon: "⚡",
      color: "#9C27B0"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            // Animate skill bars
            const skillBars = entry.target.querySelectorAll('.skill-bar-fill');
            skillBars.forEach((bar, index) => {
              setTimeout(() => {
                bar.style.width = bar.dataset.level + '%';
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="skills" ref={skillsRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Skills & Expertise</h2>
          <p className="section-subtitle">Technical skills and professional achievements</p>
        </div>

        <div className="skills-content">
          <div className="skills-grid">
            {skillCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="skill-category">
                <div className="category-header">
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.title}</h3>
                </div>
                <div className="skills-list">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="skill-item">
                      <div className="skill-info">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percentage">{skill.level}%</span>
                      </div>
                      <div className="skill-bar">
                        <div
                          className="skill-bar-fill"
                          data-level={skill.level}
                          style={{
                            '--skill-color': skill.color,
                            width: '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="achievements-section">
            <h3>Professional Achievements</h3>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div
                    className="achievement-icon"
                    style={{ backgroundColor: achievement.color }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="certifications">
          <h3>Certifications & Learning</h3>
          <div className="cert-grid">
            <div className="cert-item">
              <div className="cert-icon">📜</div>
              <div className="cert-content">
                <h4>Google Android Developer Certification</h4>
                <p>Associate Android Developer</p>
              </div>
            </div>
            <div className="cert-item">
              <div className="cert-icon">🎓</div>
              <div className="cert-content">
                <h4>Flutter Development Course</h4>
                <p>Complete Flutter Development Bootcamp</p>
              </div>
            </div>
            <div className="cert-item">
              <div className="cert-icon">🏅</div>
              <div className="cert-content">
                <h4>Kotlin for Android</h4>
                <p>JetBrains Kotlin Certification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
