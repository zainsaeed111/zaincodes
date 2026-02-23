import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import { pushToGitHub } from '../utils/githubSync';

const ADMIN_PASSWORD = 'zaincodes2024'; // Change this to your password

/* ── Default data (mirrors the hardcoded values in Hero / Skills / About) ── */
const defaultHero = {
    title: "Full-Stack Developer Specialized in Web & Mobile Apps",
    greeting: "Hi, I'm Zain",
    description: "I build high-performance web platforms and mobile applications using React, Next.js, Android (Kotlin/Java) and Flutter. With a passion for clean architecture and pixel-perfect design, I transform ideas into scalable digital products that deliver real impact.",
    badge: "Available for new projects",
    statApps: 50,
    statYears: 3,
    statSatisfaction: 100
};

const defaultAbout = {
    subtitle: "Passionate about building exceptional web & mobile experiences",
    introTitle: "Hello! I'm Zain, a Full-Stack Developer",
    introText: "With over 3 years of experience in web and mobile development, I specialize in building robust, scalable applications using React, Next.js, Android (Kotlin/Java) and Flutter — from pixel-perfect frontends to production-ready backends.",
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

const defaultSkills = [
    {
        title: "Web Development", icon: "🌐",
        skills: [
            { name: "React / Next.js", level: 92, color: "#61DAFB" },
            { name: "TypeScript", level: 88, color: "#3178C6" },
            { name: "HTML / CSS", level: 95, color: "#E34F26" },
            { name: "Tailwind CSS", level: 85, color: "#06B6D4" },
            { name: "Node.js", level: 85, color: "#339933" }
        ]
    },
    {
        title: "Mobile Development", icon: "📱",
        skills: [
            { name: "Android (Kotlin)", level: 95, color: "#3DDC84" },
            { name: "Android (Java)", level: 90, color: "#F57C00" },
            { name: "Flutter", level: 88, color: "#2196F3" },
            { name: "React Native", level: 75, color: "#61DAFB" },
            { name: "iOS (Swift)", level: 70, color: "#007AFF" }
        ]
    },
    {
        title: "Backend & Database", icon: "⚙️",
        skills: [
            { name: "Firebase", level: 92, color: "#FFA000" },
            { name: "PostgreSQL", level: 85, color: "#336791" },
            { name: "REST APIs", level: 90, color: "#FF6B6B" },
            { name: "MongoDB", level: 80, color: "#47A248" },
            { name: "Docker", level: 75, color: "#2496ED" }
        ]
    },
    {
        title: "Tools & Design", icon: "🎨",
        skills: [
            { name: "Git / GitHub", level: 90, color: "#F05032" },
            { name: "Figma", level: 85, color: "#F24E1E" },
            { name: "VS Code", level: 88, color: "#007ACC" },
            { name: "CI/CD", level: 80, color: "#FF6B35" },
            { name: "Material Design", level: 95, color: "#00C9A7" }
        ]
    }
];

const defaultContact = {
    email: "zain@zaincodes.dev",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA"
};

const defaultSocial = [
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/zaincodes' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/zaincodes' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/zaincodes' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/zaincodes' }
];

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
        githubLink: "#",
        liveLink: "#"
    }
];

/* ── Helpers ── */
const load = (key, fallback) => {
    try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : fallback;
    } catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */
const AdminPanel = () => {
    const navigate = useNavigate();

    /* ── Auth ── */
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    /* ── Active tab ── */
    const [activeTab, setActiveTab] = useState('hero');

    /* ── Data state ── */
    const [hero, setHero] = useState(defaultHero);
    const [about, setAbout] = useState(defaultAbout);
    const [skills, setSkills] = useState(defaultSkills);
    const [contact, setContact] = useState(defaultContact);
    const [social, setSocial] = useState(defaultSocial);
    const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark');
    const [projects, setProjects] = useState([]);
    const [resumeLink, setResumeLink] = useState('');
    const [githubToken, setGithubToken] = useState(() => localStorage.getItem('REACT_APP_GITHUB_TOKEN') || '');
    const [isSyncing, setIsSyncing] = useState(false);

    /* ── Project form ── */
    const [editingProject, setEditingProject] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', slug: '', category: 'web', description: '', longDescription: '',
        thumbnail: '', image: '', technologies: '', features: '', highlights: '',
        playStoreLink: '', githubLink: '', liveLink: ''
    });

    /* ── Skill editor ── */
    const [editingSkillCat, setEditingSkillCat] = useState(null);
    const [skillForm, setSkillForm] = useState({ title: '', icon: '', skills: '' });

    /* ── Social editor ── */
    const [editingSocial, setEditingSocial] = useState(null);
    const [socialForm, setSocialForm] = useState({ name: '', icon: '', url: '' });

    /* ── Toast ── */
    const [toast, setToast] = useState('');
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    /* ── Init ── */
    const saveTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('siteTheme', newTheme);
        document.documentElement.className = newTheme === 'light' ? 'light-theme' : '';
        saveTheme('siteTheme', newTheme);
        showToast(`Appearance updated to ${newTheme} mode!`);
        triggerGlobalSync();
    };

    const triggerGlobalSync = async () => {
        if (!githubToken) return;

        setIsSyncing(true);
        try {
            const fullData = {
                heroData: hero,
                aboutData: about,
                skillsData: skills,
                contactData: contact,
                socialLinks: social,
                portfolioProjects: projects,
                resumeLink: resumeLink,
                siteTheme: theme
            };
            await pushToGitHub(fullData);
            showToast('Changes synced globally! Vercel is redeploying.');
        } catch (err) {
            showToast('Sync failed: ' + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (sessionStorage.getItem('adminAuth') === 'true') setIsAuthenticated(true);
        setHero(load('heroData', defaultHero));
        setAbout(load('aboutData', defaultAbout));
        setSkills(load('skillsData', defaultSkills));
        setContact(load('contactData', defaultContact));
        setSocial(load('socialData', defaultSocial));

        const savedProjects = load('portfolioProjects', []);
        if (savedProjects && savedProjects.length > 0) {
            setProjects(savedProjects);
        } else {
            setProjects(defaultProjects);
        }

        const currentTheme = localStorage.getItem('siteTheme') || 'dark';
        document.documentElement.className = currentTheme === 'light' ? 'light-theme' : '';

        setResumeLink(localStorage.getItem('resumeLink') || '');
    }, []);

    /* ── Auth handlers ── */
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem('adminAuth', 'true'); }
        else alert('Incorrect password!');
    };
    const handleLogout = () => { setIsAuthenticated(false); sessionStorage.removeItem('adminAuth'); };

    /* ── Hero ── */
    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setHero(prev => ({ ...prev, [name]: name.startsWith('stat') ? Number(value) : value }));
    };
    const saveHero = () => { save('heroData', hero); showToast('Hero section saved!'); triggerGlobalSync(); };

    /* ── About ── */
    const handleAboutChange = (e) => {
        const { name, value } = e.target;
        setAbout(prev => ({ ...prev, [name]: value }));
    };
    const saveAbout = () => { save('aboutData', about); showToast('About section saved!'); triggerGlobalSync(); };
    const addTech = () => {
        const name = prompt('Tech name (e.g. React)');
        if (!name) return;
        const icon = prompt('Emoji icon', '🔧');
        const color = prompt('Hex color', '#61DAFB');
        setAbout(prev => ({ ...prev, techStack: [...prev.techStack, { name, icon, color }] }));
    };
    const removeTech = (idx) => {
        setAbout(prev => ({ ...prev, techStack: prev.techStack.filter((_, i) => i !== idx) }));
    };

    /* ── Contact ── */
    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
    };
    const saveContact = () => { save('contactData', contact); showToast('Contact info saved!'); triggerGlobalSync(); };

    /* ── Social ── */
    const openSocialEditor = (idx) => {
        const s = idx !== null ? social[idx] : { name: '', icon: '', url: '' };
        setEditingSocial(idx);
        setSocialForm(s);
    };
    const saveSocialItem = () => {
        let updated;
        if (editingSocial !== null) {
            updated = social.map((s, i) => i === editingSocial ? socialForm : s);
        } else {
            updated = [...social, socialForm];
        }
        setSocial(updated);
        save('socialData', updated);
        setEditingSocial(null);
        showToast('Social link saved!');
        triggerGlobalSync();
    };
    const deleteSocialItem = (idx) => {
        if (!window.confirm('Remove this social link?')) return;
        const updated = social.filter((_, i) => i !== idx);
        setSocial(updated);
        save('socialData', updated);
        showToast('Social link removed');
        triggerGlobalSync();
    };

    /* ── Skills ── */
    const openSkillEditor = (catIdx) => {
        const cat = catIdx !== null ? skills[catIdx] : { title: '', icon: '🌐', skills: [] };
        setEditingSkillCat(catIdx);
        setSkillForm({
            title: cat.title,
            icon: cat.icon,
            skills: cat.skills.map(s => `${s.name}:${s.level}:${s.color}`).join('\n')
        });
    };
    const saveSkillCategory = () => {
        const parsed = skillForm.skills.split('\n').filter(l => l.trim()).map(line => {
            const [name, level, color] = line.split(':').map(s => s.trim());
            return { name: name || 'Skill', level: parseInt(level) || 80, color: color || '#00C9A7' };
        });
        const cat = { title: skillForm.title, icon: skillForm.icon, skills: parsed };
        let updated;
        if (editingSkillCat !== null) {
            updated = skills.map((s, i) => i === editingSkillCat ? cat : s);
        } else {
            updated = [...skills, cat];
        }
        setSkills(updated);
        save('skillsData', updated);
        setEditingSkillCat(null);
        showToast('Skill category saved!');
        triggerGlobalSync();
    };
    const deleteSkillCategory = (idx) => {
        if (!window.confirm('Delete this skill category?')) return;
        const updated = skills.filter((_, i) => i !== idx);
        setSkills(updated);
        save('skillsData', updated);
        showToast('Category deleted');
        triggerGlobalSync();
    };

    /* ── Projects (existing logic preserved) ── */
    const generateSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value, ...(name === 'title' ? { slug: generateSlug(value) } : {}) }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const d = {
            id: editingProject ? editingProject.id : Date.now(),
            title: formData.title, slug: formData.slug || generateSlug(formData.title),
            category: formData.category, description: formData.description,
            longDescription: formData.longDescription,
            thumbnail: formData.thumbnail, image: formData.image || formData.thumbnail,
            technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
            features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
            highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean),
            playStoreLink: formData.playStoreLink || '#',
            githubLink: formData.githubLink || '#',
            liveLink: formData.liveLink || '#'
        };
        const updated = editingProject ? projects.map(p => p.id === editingProject.id ? d : p) : [...projects, d];
        setProjects(updated); save('portfolioProjects', updated);
        resetForm(); showToast(editingProject ? 'Project updated!' : 'Project added!');
        triggerGlobalSync();
    };
    const resetForm = () => {
        setFormData({
            title: '', slug: '', category: 'web', description: '', longDescription: '',
            thumbnail: '', image: '', technologies: '', features: '', highlights: '',
            playStoreLink: '', githubLink: '', liveLink: ''
        });
        setEditingProject(null); setShowForm(false);
    };
    const handleEdit = (p) => {
        setFormData({
            title: p.title, slug: p.slug, category: p.category,
            description: p.description, longDescription: p.longDescription || '',
            thumbnail: p.thumbnail, image: p.image || '',
            technologies: p.technologies.join(', '), features: p.features.join(', '),
            highlights: p.highlights ? p.highlights.join(', ') : '',
            playStoreLink: p.playStoreLink || '', githubLink: p.githubLink || '',
            liveLink: p.liveLink || ''
        });
        setEditingProject(p); setShowForm(true);
    };
    const handleDelete = (id) => {
        if (!window.confirm('Delete this project?')) return;
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated); save('portfolioProjects', updated);
        triggerGlobalSync();
    };

    /* ── Resume ── */
    const handleResumeUpdate = () => { localStorage.setItem('resumeLink', resumeLink); showToast('Resume link saved!'); };

    /* ── Export / Import ── */
    const handleExport = () => {
        const data = { hero, about, skills, contact, social, projects, resumeLink };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'portfolio-data.json'; a.click();
    };
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.hero) { setHero(data.hero); save('heroData', data.hero); }
                if (data.about) { setAbout(data.about); save('aboutData', data.about); }
                if (data.skills) { setSkills(data.skills); save('skillsData', data.skills); }
                if (data.contact) { setContact(data.contact); save('contactData', data.contact); }
                if (data.social) { setSocial(data.social); save('socialData', data.social); }
                if (data.projects) { setProjects(data.projects); save('portfolioProjects', data.projects); }
                if (data.resumeLink) { setResumeLink(data.resumeLink); localStorage.setItem('resumeLink', data.resumeLink); }
                showToast('All data imported!');
            } catch { alert('Invalid file format!'); }
        };
        reader.readAsText(file);
    };

    /* ══════════════════════════ LOGIN SCREEN ══════════════════════════ */
    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <h1>🔐 Admin Panel</h1>
                    <p>Enter password to access</p>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoFocus />
                        <button type="submit" className="btn-primary">Login</button>
                    </form>
                    <button className="back-btn" onClick={() => navigate('/')}>← Back to Portfolio</button>
                </div>
            </div>
        );
    }

    /* ── Tabs config ── */
    const tabs = [
        { id: 'hero', label: '🏠 Hero', count: null },
        { id: 'about', label: '👤 About', count: null },
        { id: 'skills', label: '⚡ Skills', count: skills.length },
        { id: 'contact', label: '📞 Contact', count: null },
        { id: 'projects', label: '🚀 Projects', count: projects.length },
        { id: 'settings', label: '⚙️ Settings', count: null }
    ];

    /* ══════════════════════════ MAIN PANEL ══════════════════════════ */
    return (
        <div className="admin-panel">
            {/* Toast */}
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <header className="admin-header">
                <h1>📊 Portfolio Admin</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/')} className="btn-secondary"><span>View Site</span></button>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            {/* Tab bar */}
            <div className="admin-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`admin-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.label}{t.count !== null && <span className="tab-count">{t.count}</span>}
                    </button>
                ))}
            </div>

            <main className="admin-content">
                {/* ──────── HERO TAB ──────── */}
                {activeTab === 'hero' && (
                    <section className="admin-section">
                        <h2>🏠 Hero Section</h2>
                        <p className="section-info">Edit the hero banner that visitors see first.</p>
                        <div className="admin-form-grid">
                            <div className="form-group full-width">
                                <label>Badge Text</label>
                                <input name="badge" value={hero.badge} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Greeting Line</label>
                                <input name="greeting" value={hero.greeting} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Typed Title (animated text)</label>
                                <input name="title" value={hero.title} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea name="description" value={hero.description} onChange={handleHeroChange} rows="3" />
                            </div>
                            <div className="form-group">
                                <label>Apps Built (stat number)</label>
                                <input type="number" name="statApps" value={hero.statApps} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Years Experience</label>
                                <input type="number" name="statYears" value={hero.statYears} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Client Satisfaction %</label>
                                <input type="number" name="statSatisfaction" value={hero.statSatisfaction} onChange={handleHeroChange} />
                            </div>
                        </div>
                        <div className="admin-save-bar">
                            <button onClick={saveHero} className="btn-primary"><span>Save Hero</span></button>
                        </div>
                    </section>
                )}

                {/* ──────── ABOUT TAB ──────── */}
                {activeTab === 'about' && (
                    <section className="admin-section">
                        <h2>👤 About Section</h2>
                        <p className="section-info">Edit the About Me area and tech stack.</p>
                        <div className="admin-form-grid">
                            <div className="form-group full-width">
                                <label>Section Subtitle</label>
                                <input name="subtitle" value={about.subtitle} onChange={handleAboutChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Intro Title</label>
                                <input name="introTitle" value={about.introTitle} onChange={handleAboutChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Intro Paragraph</label>
                                <textarea name="introText" value={about.introText} onChange={handleAboutChange} rows="4" />
                            </div>
                        </div>

                        <h3 className="sub-heading">Tech Stack</h3>
                        <div className="tech-chips">
                            {about.techStack.map((t, i) => (
                                <span key={i} className="tech-chip" style={{ borderColor: t.color }}>
                                    {t.icon} {t.name} <button onClick={() => removeTech(i)}>×</button>
                                </span>
                            ))}
                            <button className="tech-chip add-chip" onClick={addTech}>+ Add</button>
                        </div>

                        <div className="admin-save-bar">
                            <button onClick={saveAbout} className="btn-primary"><span>Save About</span></button>
                        </div>
                    </section>
                )}

                {/* ──────── SKILLS TAB ──────── */}
                {activeTab === 'skills' && (
                    <section className="admin-section">
                        <div className="section-header-admin">
                            <div><h2>⚡ Skills</h2><p className="section-info" style={{ marginBottom: 0 }}>Manage skill categories and proficiency levels.</p></div>
                            <button onClick={() => openSkillEditor(null)} className="btn-primary"><span>+ Add Category</span></button>
                        </div>

                        <div className="skills-admin-grid">
                            {skills.map((cat, catIdx) => (
                                <div key={catIdx} className="skill-cat-card">
                                    <div className="skill-cat-header">
                                        <span className="skill-cat-icon">{cat.icon}</span>
                                        <h4>{cat.title}</h4>
                                        <div className="skill-cat-actions">
                                            <button onClick={() => openSkillEditor(catIdx)} className="btn-edit">Edit</button>
                                            <button onClick={() => deleteSkillCategory(catIdx)} className="btn-delete">Del</button>
                                        </div>
                                    </div>
                                    <div className="skill-cat-list">
                                        {cat.skills.map((s, sIdx) => (
                                            <div key={sIdx} className="skill-preview">
                                                <span>{s.name}</span>
                                                <div className="skill-bar-mini"><div style={{ width: `${s.level}%`, background: s.color }} /></div>
                                                <span className="skill-lvl">{s.level}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ──────── CONTACT TAB ──────── */}
                {activeTab === 'contact' && (
                    <section className="admin-section">
                        <h2>📞 Contact & Social</h2>
                        <p className="section-info">Edit your contact details and social media links appearing in Contact and Footer sections.</p>

                        <div className="admin-form-grid">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" value={contact.email} onChange={handleContactChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input name="phone" value={contact.phone} onChange={handleContactChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Location</label>
                                <input name="location" value={contact.location} onChange={handleContactChange} />
                            </div>
                        </div>
                        <div className="admin-save-bar">
                            <button onClick={saveContact} className="btn-primary"><span>Save Contact Info</span></button>
                        </div>

                        <h3 className="sub-heading">Social Media Links</h3>
                        <div className="social-admin-grid">
                            {social.map((s, idx) => (
                                <div key={idx} className="social-item-card">
                                    <span className="social-icon-large">{s.icon}</span>
                                    <div className="social-info">
                                        <h4>{s.name}</h4>
                                        <p>{s.url}</p>
                                    </div>
                                    <div className="social-actions">
                                        <button onClick={() => openSocialEditor(idx)} className="btn-edit">Edit</button>
                                        <button onClick={() => deleteSocialItem(idx)} className="btn-delete">Remove</button>
                                    </div>
                                </div>
                            ))}
                            <button className="add-social-btn" onClick={() => openSocialEditor(null)}>
                                <span>+ Add New Social Link</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* ──────── PROJECTS TAB ──────── */}
                {activeTab === 'projects' && (
                    <section className="admin-section">
                        <div className="section-header-admin">
                            <h2>🚀 Projects ({projects.length})</h2>
                            <button onClick={() => setShowForm(true)} className="btn-primary"><span>+ Add Project</span></button>
                        </div>
                        <div className="projects-list">
                            {projects.length === 0 ? (
                                <p className="no-projects">No custom projects yet. Default projects are shown on the site. Click "Add Project" to override with your own!</p>
                            ) : (
                                projects.map(project => (
                                    <div key={project.id} className="project-card-admin">
                                        <img src={project.thumbnail} alt={project.title} />
                                        <div className="project-info-admin">
                                            <h4>{project.title}</h4>
                                            <span className="category-badge">{project.category}</span>
                                            <p>{project.description}</p>
                                        </div>
                                        <div className="project-actions-admin">
                                            <button onClick={() => handleEdit(project)} className="btn-edit">Edit</button>
                                            <button onClick={() => handleDelete(project.id)} className="btn-delete">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* ──────── SETTINGS TAB ──────── */}
                {activeTab === 'settings' && (
                    <div className="admin-settings-container">
                        <section className="admin-section appearance-settings">
                            <h2>✨ Appearance</h2>
                            <p className="section-info">Choose the look and feel of your portfolio. Switching themes will affect both the main site and this admin panel.</p>
                            <div className="theme-toggle-grid">
                                <button
                                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => saveTheme('dark')}
                                >
                                    <span className="theme-icon">🌙</span>
                                    <div className="theme-details">
                                        <strong>Dark Mode</strong>
                                        <span>Premium emerald & teal dark theme</span>
                                    </div>
                                    <div className="theme-check">✓</div>
                                </button>
                                <button
                                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => saveTheme('light')}
                                >
                                    <span className="theme-icon">☀️</span>
                                    <div className="theme-details">
                                        <strong>Light Mode</strong>
                                        <span>Professional slate & indigo light theme</span>
                                    </div>
                                    <div className="theme-check">✓</div>
                                </button>
                            </div>
                        </section>

                        <section className="admin-section">
                            <h2>📄 Resume Link</h2>
                            <p className="section-info">Upload your resume to Google Drive, then paste the shareable link here.</p>
                            <div className="resume-form">
                                <input type="url" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} placeholder="https://drive.google.com/your-resume-link" />
                                <button onClick={() => { handleResumeUpdate(); triggerGlobalSync(); }} className="btn-primary"><span>Save</span></button>
                            </div>
                        </section>

                        <section className="admin-section github-sync-settings">
                            <h2>🌐 Global Sync (Real-Time)</h2>
                            <p className="section-info">To make changes reflect globally on all devices, enter your <strong>GitHub Personal Access Token</strong>. Changes will then be committed directly to your repository.</p>
                            <div className="resume-form">
                                <input
                                    type="password"
                                    value={githubToken}
                                    onChange={(e) => {
                                        setGithubToken(e.target.value);
                                        localStorage.setItem('REACT_APP_GITHUB_TOKEN', e.target.value);
                                    }}
                                    placeholder="ghp_xxxxxxxxxxxx"
                                />
                                <button onClick={triggerGlobalSync} className="btn-primary" disabled={isSyncing || !githubToken}>
                                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                                </button>
                            </div>
                            {!githubToken && <p className="token-hint">Don't have a token? <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer">Create one with 'repo' scope</a></p>}
                        </section>
                        <section className="admin-section">
                            <h2>💾 Backup & Restore</h2>
                            <p className="section-info">Export ALL data (hero, about, skills, projects, resume) or import from backup.</p>
                            <div className="backup-actions">
                                <button onClick={handleExport} className="btn-secondary"><span>Export All Data</span></button>
                                <label className="btn-secondary import-btn"><span>Import Data</span><input type="file" accept=".json" onChange={handleImport} hidden /></label>
                            </div>
                        </section>
                        <section className="admin-section danger-zone">
                            <h2>🗑️ Reset to Defaults</h2>
                            <p className="section-info">Reset all sections to their default values.</p>
                            <div className="backup-actions">
                                <button className="btn-delete" onClick={() => {
                                    if (!window.confirm('Reset ALL data to defaults? This cannot be undone.')) return;
                                    setHero(defaultHero); save('heroData', defaultHero);
                                    setAbout(defaultAbout); save('aboutData', defaultAbout);
                                    setSkills(defaultSkills); save('skillsData', defaultSkills);
                                    setContact(defaultContact); save('contactData', defaultContact);
                                    setSocial(defaultSocial); save('socialData', defaultSocial);
                                    setProjects(defaultProjects); save('portfolioProjects', defaultProjects);
                                    setResumeLink(''); localStorage.removeItem('resumeLink');
                                    saveTheme('dark');
                                    showToast('All data reset to defaults');
                                }}>Reset Everything</button>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* ──────── PROJECT FORM OVERLAY ──────── */}
            {showForm && (
                <div className="project-form-overlay">
                    <form className="project-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button type="button" onClick={resetForm} className="close-btn">×</button>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label>Project Title *</label><input type="text" name="title" value={formData.title} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label>URL Slug</label><input type="text" name="slug" value={formData.slug} onChange={handleFormChange} placeholder="auto-generated" /></div>
                            <div className="form-group"><label>Category *</label>
                                <select name="category" value={formData.category} onChange={handleFormChange}>
                                    <option value="web">Web</option><option value="android">Android</option><option value="flutter">Flutter</option>
                                </select></div>
                            <div className="form-group"><label>Thumbnail URL *</label><input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleFormChange} placeholder="https://i.ibb.co/..." required /></div>
                            <div className="form-group full-width"><label>Short Description *</label><textarea name="description" value={formData.description} onChange={handleFormChange} rows="2" required /></div>
                            <div className="form-group full-width"><label>Long Description</label><textarea name="longDescription" value={formData.longDescription} onChange={handleFormChange} rows="4" /></div>
                            <div className="form-group full-width"><label>Technologies (comma separated) *</label><input type="text" name="technologies" value={formData.technologies} onChange={handleFormChange} placeholder="React, Next.js, TypeScript" required /></div>
                            <div className="form-group full-width"><label>Features (comma separated)</label><input type="text" name="features" value={formData.features} onChange={handleFormChange} placeholder="Auth, Dashboard, Analytics" /></div>
                            <div className="form-group full-width"><label>Highlights (comma separated)</label><input type="text" name="highlights" value={formData.highlights} onChange={handleFormChange} placeholder="99.9% uptime, 10K users" /></div>
                            <div className="form-group"><label>Live / App URL</label><input type="url" name="liveLink" value={formData.liveLink} onChange={handleFormChange} placeholder="https://..." /></div>
                            <div className="form-group"><label>Play Store Link</label><input type="url" name="playStoreLink" value={formData.playStoreLink} onChange={handleFormChange} /></div>
                            <div className="form-group full-width"><label>GitHub Link</label><input type="url" name="githubLink" value={formData.githubLink} onChange={handleFormChange} /></div>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="btn-secondary"><span>Cancel</span></button>
                            <button type="submit" className="btn-primary"><span>{editingProject ? 'Update' : 'Add Project'}</span></button>
                        </div>
                    </form>
                </div>
            )}

            {/* ──────── SKILL EDITOR OVERLAY ──────── */}
            {editingSkillCat !== null && editingSkillCat !== undefined && (
                <div className="project-form-overlay">
                    <div className="project-form">
                        <div className="form-header">
                            <h3>{typeof editingSkillCat === 'number' ? 'Edit Category' : 'Add Category'}</h3>
                            <button type="button" onClick={() => setEditingSkillCat(null)} className="close-btn">×</button>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label>Category Name</label><input value={skillForm.title} onChange={e => setSkillForm(p => ({ ...p, title: e.target.value }))} /></div>
                            <div className="form-group"><label>Icon (emoji)</label><input value={skillForm.icon} onChange={e => setSkillForm(p => ({ ...p, icon: e.target.value }))} /></div>
                            <div className="form-group full-width">
                                <label>Skills (one per line: <code>Name:Level:Color</code>)</label>
                                <textarea rows="8" value={skillForm.skills} onChange={e => setSkillForm(p => ({ ...p, skills: e.target.value }))} placeholder={"React:92:#61DAFB\nTypeScript:88:#3178C6"} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setEditingSkillCat(null)} className="btn-secondary"><span>Cancel</span></button>
                            <button onClick={saveSkillCategory} className="btn-primary"><span>Save Category</span></button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──────── SOCIAL EDITOR OVERLAY ──────── */}
            {editingSocial !== null && editingSocial !== undefined && (
                <div className="project-form-overlay">
                    <div className="project-form">
                        <div className="form-header">
                            <h3>{typeof editingSocial === 'number' ? 'Edit Social Link' : 'Add Social Link'}</h3>
                            <button type="button" onClick={() => setEditingSocial(null)} className="close-btn">×</button>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label>Platform Name</label><input value={socialForm.name} onChange={e => setSocialForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. GitHub" /></div>
                            <div className="form-group"><label>Icon (emoji)</label><input value={socialForm.icon} onChange={e => setSocialForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. 🐙" /></div>
                            <div className="form-group full-width"><label>Profile URL</label><input value={socialForm.url} onChange={e => setSocialForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setEditingSocial(null)} className="btn-secondary"><span>Cancel</span></button>
                            <button onClick={saveSocialItem} className="btn-primary"><span>Save Link</span></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
