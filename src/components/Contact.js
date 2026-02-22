import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const contactRef = useRef(null);

  // Load contact and social data from localStorage
  const contactData = (() => {
    try {
      const d = localStorage.getItem('contactData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const socialData = (() => {
    try {
      const d = localStorage.getItem('socialData');
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  })();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset status after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }, 2000);
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

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: contactData?.email || "zain@zaincodes.dev",
      link: `mailto:${contactData?.email || "zain@zaincodes.dev"}`
    },
    {
      icon: "📱",
      title: "Phone",
      value: contactData?.phone || "+1 (555) 123-4567",
      link: `tel:${(contactData?.phone || "+15551234567").replace(/[^0-9+]/g, '')}`
    },
    {
      icon: "📍",
      title: "Location",
      value: contactData?.location || "San Francisco, CA",
      link: "#"
    }
  ];

  const socialLinks = socialData || [
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/zaincodes' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/zaincodes' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/zaincodes' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/zaincodes' }
  ];

  return (
    <section id="contact" className="contact" ref={contactRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Ready to start your next mobile app project? Let's talk!</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-header">
              <h3>Let's Build Something Amazing Together</h3>
              <p>
                I'm always excited to work on new projects and help bring innovative
                mobile app ideas to life. Whether you have a clear vision or just
                a concept, I'm here to help make it happen.
              </p>
            </div>

            <div className="contact-details">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.link}
                  className="contact-item"
                  target={info.link.startsWith('http') ? '_blank' : '_self'}
                  rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                >
                  <div className="contact-icon">{info.icon}</div>
                  <div className="contact-text">
                    <h4>{info.title}</h4>
                    <p>{info.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="social-links">
              <h4>Follow Me</h4>
              <div className="social-icons">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <span className="social-icon">{social.icon}</span>
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>Send me a message</h3>
                <p>I'll get back to you within 24 hours</p>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
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
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  <span>Message sent successfully! I'll get back to you soon.</span>
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
