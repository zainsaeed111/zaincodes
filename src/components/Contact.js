import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';
import usePortfolioData from '../hooks/usePortfolioData';

const Contact = () => {
  const { contactData, socialLinks } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    platform: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const contactRef = useRef(null);

  const email = contactData?.email || 'iamzainofficial4211@gmail.com';
  const phone = contactData?.phone || '+92-304-9057852';
  const location = contactData?.location || 'Lahore, Pakistan';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', platform: '', message: '' });

      setTimeout(() => {
        setSubmitStatus(null);
      }, 4000);
    }, 1500);
  };

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

    if (contactRef.current) observer.observe(contactRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="contact-section" ref={contactRef}>
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="section-title">Schedule <span className="text-gradient">Discovery Call</span></h2>
          <p className="section-subtitle">
            Describe your software requirements and we will schedule a technical discovery call within 24 hours.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Info Card */}
          <div className="contact-info-card glass-card">
            <h3>Direct Contact</h3>
            <p>Ready to engineer your product? Reach out directly or send an enquiry form.</p>

            <div className="contact-details-list">
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <div className="detail-text">
                  <small>Email</small>
                  <strong>{email}</strong>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📞</span>
                <div className="detail-text">
                  <small>Phone</small>
                  <strong>{phone}</strong>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div className="detail-text">
                  <small>Location</small>
                  <strong>{location}</strong>
                </div>
              </div>
            </div>

            {socialLinks && socialLinks.length > 0 && (
              <div className="contact-socials">
                <small className="socials-label">Connect Socially</small>
                <div className="socials-row">
                  {socialLinks.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-pill"
                      title={s.name}
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form Card */}
          <div className="contact-form-card glass-card">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Zain Saeed"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@company.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="platform">Target Platform *</label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Platform Track</option>
                  <option value="android">Android Native (Kotlin)</option>
                  <option value="flutter">Flutter (Cross-Platform)</option>
                  <option value="web">Web Platform (React/Next)</option>
                  <option value="backend">Backend &amp; API Infrastructure</option>
                  <option value="fullstack">Full Product Lifecycle</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Project Scope &amp; Details *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe product goals, target timelines, and core deliverables..."
                ></textarea>
              </div>

              <button
                type="submit"
                className={`btn-primary submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Discovery Request'}
              </button>

              {submitStatus === 'success' && (
                <div className="form-success-banner">
                  <span>✓ Request received! We will respond within 24 hours.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
