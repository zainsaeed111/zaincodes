import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import { pushToGitHub } from '../utils/githubSync';
import {
    verifyAdminPassword,
    updateAdminPassword,
    checkLoginAttempts,
    recordFailedLogin,
    recordSuccessfulLogin,
    validateSession,
    terminateSession,
    sanitizeInput
} from '../utils/security';
import { processResumeUpload, downloadResume } from '../utils/resumeHelper';

/* ── Default data (mirrors the hardcoded values in Hero / Skills / About) ── */
const defaultHero = {
    title: "Product Engineer & Architect",
    greeting: "Hi, I'm Zain",
    description: "I build high-performance web platforms and mobile applications using React, Next.js, Android (Kotlin/Java) and Flutter. With a passion for clean architecture and pixel-perfect design, I transform ideas into scalable digital products that deliver real impact.",
    badge: "Available for new projects",
    avatarUrl: "/Profile.webp",
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
    email: "zain@zaincodes.tech",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA"
};

const defaultSocial = [
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/zainsaeed111' },
    { name: 'LinkedIn', icon: '💼', url: 'https://www.linkedin.com/in/zainsaeeddeveloper/' },
    { name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/zain__world' }
];

const defaultProjects = [
    {
        id: 1,
        slug: "e-commerce-mobile-app",
        title: "E-Commerce Mobile App",
        category: "mobile",
        description: "Full-featured shopping app with real-time inventory and payments.",
        longDescription: "A comprehensive e-commerce mobile application built for iOS and Android.",
        technologies: ["React Native", "Firebase", "Stripe", "Redux"],
        features: ["Real-time inventory tracking", "Stripe payment integration", "Order history & tracking"],
        liveUrl: "", githubUrl: "https://github.com/zainsaeed111"
    }
];

/* ── Storage helper ── */
const load = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
};
const save = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.error('Save error:', e); }
};

const AdminPanel = () => {
    const navigate = useNavigate();

    /* ── Auth State ── */
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [lockoutStatus, setLockoutStatus] = useState(null);

    /* ── Master Password Change State ── */
    const [newMasterPassword, setNewMasterPassword] = useState('');
    const [confirmMasterPassword, setConfirmMasterPassword] = useState('');

    /* ── Active Tab ── */
    const [activeTab, setActiveTab] = useState('hero');

    /* ── Data States ── */
    const [hero, setHero] = useState(defaultHero);
    const [about, setAbout] = useState(defaultAbout);
    const [skills, setSkills] = useState(defaultSkills);
    const [contact, setContact] = useState(defaultContact);
    const [social, setSocial] = useState(defaultSocial);
    const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark');
    const [projects, setProjects] = useState([]);
    
    /* ── Resume & File Upload State ── */
    const [resumeLink, setResumeLink] = useState('');
    const [resumeFileName, setResumeFileName] = useState(() => localStorage.getItem('resumeFileName') || '');
    const [resumeFileSize, setResumeFileSize] = useState(() => localStorage.getItem('resumeFileSize') || '');
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    /* ── GitHub Sync ── */
    const [githubToken, setGithubToken] = useState(() => localStorage.getItem('REACT_APP_GITHUB_TOKEN') || process.env.REACT_APP_GITHUB_TOKEN || '');
    const [showGithubToken, setShowGithubToken] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    /* ── Project form ── */
    const [editingProject, setEditingProject] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', slug: '', category: 'android', description: '', longDescription: '',
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
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    /* ── Appearance ── */
    const saveTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('siteTheme', newTheme);
        document.documentElement.className = newTheme === 'light' ? 'light-theme' : '';
        document.body.className = newTheme === 'light' ? 'light-theme' : '';
        showToast(`Appearance updated to ${newTheme} mode!`);
        triggerGlobalSync();
    };

    const triggerGlobalSync = async (overrides = {}) => {
        if (!githubToken) return;

        setIsSyncing(true);
        try {
            const fullData = {
                heroData: overrides.heroData || hero,
                aboutData: overrides.aboutData || about,
                skillsData: overrides.skillsData || skills,
                contactData: overrides.contactData || contact,
                socialLinks: overrides.socialLinks || social,
                portfolioProjects: overrides.portfolioProjects || projects,
                resumeLink: overrides.resumeLink !== undefined ? overrides.resumeLink : resumeLink,
                siteTheme: overrides.siteTheme || theme
            };
            await pushToGitHub(fullData);
            showToast('Changes synced globally to GitHub! Vercel is redeploying.');
        } catch (err) {
            showToast('Sync failed: ' + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    /* ── Lifecycle & Security Init ── */
    useEffect(() => {
        // Validate active session
        if (validateSession()) {
            setIsAuthenticated(true);
        }

        // Check lockout
        const attempts = checkLoginAttempts();
        if (!attempts.allowed) {
            setLockoutStatus(attempts);
        }

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
        document.body.className = currentTheme === 'light' ? 'light-theme' : '';

        setResumeLink(localStorage.getItem('resumeLink') || '');

        const activeToken = localStorage.getItem('REACT_APP_GITHUB_TOKEN') || process.env.REACT_APP_GITHUB_TOKEN || '';
        if (activeToken) {
            setGithubToken(activeToken);
            if (!localStorage.getItem('REACT_APP_GITHUB_TOKEN')) {
                localStorage.setItem('REACT_APP_GITHUB_TOKEN', activeToken);
            }
        }
    }, []);

    /* ── Auth handlers ── */
    const handleLogin = async (e) => {
        e.preventDefault();
        const check = checkLoginAttempts();
        if (!check.allowed) {
            setLockoutStatus(check);
            setLoginError(`Security Lockout: Too many failed attempts. Try again in ${check.remainingMinutes} minutes.`);
            return;
        }

        const isValid = await verifyAdminPassword(password);
        if (isValid) {
            recordSuccessfulLogin();
            setIsAuthenticated(true);
            setLoginError('');
            showToast('Authenticated securely via salted SHA-256.');
        } else {
            const result = recordFailedLogin();
            if (!result.allowed) {
                setLockoutStatus(result);
                setLoginError(`Security Lockout: Account locked for 15 minutes.`);
            } else {
                setLoginError(`Incorrect password! ${result.remainingAttempts} attempts remaining before lockout.`);
            }
        }
    };

    const handleLogout = () => {
        terminateSession();
        setIsAuthenticated(false);
        setPassword('');
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (!newMasterPassword || newMasterPassword.length < 6) {
            alert('New password must be at least 6 characters.');
            return;
        }
        if (newMasterPassword !== confirmMasterPassword) {
            alert('Passwords do not match.');
            return;
        }
        try {
            await updateAdminPassword(newMasterPassword);
            setNewMasterPassword('');
            setConfirmMasterPassword('');
            showToast('Master password successfully updated and cryptographically hashed!');
        } catch (err) {
            alert(err.message);
        }
    };

    /* ── Hero ── */
    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setHero(prev => ({ ...prev, [name]: name.startsWith('stat') ? Number(value) : sanitizeInput(value) }));
    };
    const saveHero = () => { save('heroData', hero); showToast('Hero section saved!'); triggerGlobalSync({ heroData: hero }); };

    /* ── About ── */
    const handleAboutChange = (e) => {
        const { name, value } = e.target;
        setAbout(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    };
    const saveAbout = () => { save('aboutData', about); showToast('About section saved!'); triggerGlobalSync({ aboutData: about }); };

    /* ── Skills ── */
    const saveSkills = (updated) => { setSkills(updated); save('skillsData', updated); showToast('Skills saved!'); triggerGlobalSync({ skillsData: updated }); };
    const deleteSkillCategory = (idx) => {
        if (!window.confirm('Delete this category?')) return;
        saveSkills(skills.filter((_, i) => i !== idx));
    };
    const openSkillEditor = (idx) => {
        const cat = skills[idx];
        setSkillForm({
            title: cat.title,
            icon: cat.icon,
            skills: cat.skills.map(s => `${s.name}:${s.level}:${s.color}`).join('\n')
        });
        setEditingSkillCat(idx);
    };
    const saveSkillCategory = () => {
        const parsed = skillForm.skills.split('\n').filter(l => l.trim()).map(line => {
            const [name, level, color] = line.split(':');
            return { name: name?.trim() || '', level: parseInt(level) || 80, color: color?.trim() || '#38bdf8' };
        });
        const updated = [...skills];
        const newCat = { title: skillForm.title, icon: skillForm.icon, skills: parsed };
        if (editingSkillCat === 'new') updated.push(newCat);
        else updated[editingSkillCat] = newCat;
        saveSkills(updated);
        setEditingSkillCat(null);
    };

    /* ── Contact ── */
    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    };
    const saveContact = () => { save('contactData', contact); showToast('Contact info saved!'); triggerGlobalSync({ contactData: contact }); };

    /* ── Social ── */
    const saveSocial = (updated) => { setSocial(updated); save('socialData', updated); showToast('Social links saved!'); triggerGlobalSync({ socialLinks: updated }); };
    const deleteSocial = (idx) => {
        if (!window.confirm('Delete this link?')) return;
        saveSocial(social.filter((_, i) => i !== idx));
    };
    const saveSocialItem = () => {
        const updated = [...social];
        if (editingSocial === 'new') updated.push(socialForm);
        else updated[editingSocial] = socialForm;
        saveSocial(updated);
        setEditingSocial(null);
    };

    /* ── Projects ── */
    const handleProjectFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const openAddProject = () => {
        setFormData({
            title: '', slug: '', category: 'android', description: '', longDescription: '',
            thumbnail: '', image: '', technologies: '', features: '', highlights: '',
            playStoreLink: '', githubLink: '', liveLink: ''
        });
        setEditingProject(null);
        setShowForm(true);
    };
    const openEditProject = (proj) => {
        setFormData({
            title: proj.title || '',
            slug: proj.slug || '',
            category: proj.category || 'android',
            description: proj.description || '',
            longDescription: proj.longDescription || '',
            thumbnail: proj.thumbnail || proj.image || '',
            image: proj.image || '',
            technologies: (proj.technologies || []).join(', '),
            features: (proj.features || []).join('\n'),
            highlights: (proj.highlights || []).join('\n'),
            playStoreLink: proj.playStoreLink || proj.liveUrl || '',
            githubLink: proj.githubUrl || '',
            liveLink: proj.liveUrl || ''
        });
        setEditingProject(proj);
        setShowForm(true);
    };
    const deleteProject = (id) => {
        if (!window.confirm('Delete this project?')) return;
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        save('portfolioProjects', updated);
        showToast('Project deleted');
        triggerGlobalSync({ portfolioProjects: updated });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const techArray = formData.technologies.split(',').map(t => t.trim()).filter(Boolean);
        const featArray = formData.features.split('\n').map(f => f.trim()).filter(Boolean);
        const highArray = formData.highlights.split('\n').map(h => h.trim()).filter(Boolean);

        const projectData = {
            id: editingProject ? editingProject.id : Date.now(),
            title: sanitizeInput(formData.title),
            slug: sanitizeInput(formData.slug) || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            category: formData.category,
            description: sanitizeInput(formData.description),
            longDescription: sanitizeInput(formData.longDescription),
            thumbnail: formData.thumbnail || formData.image,
            image: formData.image || formData.thumbnail,
            technologies: techArray,
            features: featArray,
            highlights: highArray,
            liveUrl: formData.playStoreLink || formData.liveLink,
            githubUrl: formData.githubLink
        };

        let updated;
        if (editingProject) {
            updated = projects.map(p => p.id === editingProject.id ? projectData : p);
            showToast('Project updated!');
        } else {
            updated = [projectData, ...projects];
            showToast('Project added!');
        }
        setProjects(updated);
        save('portfolioProjects', updated);
        triggerGlobalSync({ portfolioProjects: updated });
        resetForm();
    };
    const resetForm = () => { setShowForm(false); setEditingProject(null); };

    /* ── Resume Management (100% Free File Upload & Links) ── */
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingResume(true);
        try {
            const processed = await processResumeUpload(file);
            localStorage.setItem('resumeFileData', processed.dataUrl);
            localStorage.setItem('resumeFileName', processed.name);
            localStorage.setItem('resumeFileSize', processed.size);
            setResumeFileName(processed.name);
            setResumeFileSize(processed.size);
            showToast(`Resume "${processed.name}" uploaded successfully!`);
            triggerGlobalSync({ resumeLink: processed.name });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsUploadingResume(false);
        }
    };

    const handleRemoveResumeFile = () => {
        if (!window.confirm('Remove the uploaded resume file?')) return;
        localStorage.removeItem('resumeFileData');
        localStorage.removeItem('resumeFileName');
        localStorage.removeItem('resumeFileSize');
        setResumeFileName('');
        setResumeFileSize('');
        showToast('Uploaded resume removed.');
    };

    const handleResumeLinkUpdate = () => {
        localStorage.setItem('resumeLink', resumeLink);
        showToast('Resume link saved!');
        triggerGlobalSync({ resumeLink });
    };

    /* ── Export / Import ── */
    const handleExport = () => {
        const data = { hero, about, skills, contact, social, projects, resumeLink };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'portfolio-data-backup.json'; a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.hero) { setHero(data.hero); save('heroData', data.hero); }
                if (data.about) { setAbout(data.about); save('aboutData', data.about); }
                if (data.skills) { setSkills(data.skills); save('skillsData', data.skills); }
                if (data.contact) { setContact(data.contact); save('contactData', data.contact); }
                if (data.social) { setSocial(data.social); save('socialData', data.social); }
                if (data.projects) { setProjects(data.projects); save('portfolioProjects', data.projects); }
                if (data.resumeLink) { setResumeLink(data.resumeLink); localStorage.setItem('resumeLink', data.resumeLink); }
                showToast('All data successfully imported!');
            } catch { alert('Invalid file format!'); }
        };
        reader.readAsText(file);
    };

    /* ══════════════════════════ SECURE LOGIN SCREEN ══════════════════════════ */
    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <div className="login-shield-badge">🛡️</div>
                    <h1>Admin Authentication</h1>
                    <p>Secured with Salted SHA-256 &amp; Brute-Force Shield</p>

                    {lockoutStatus && !lockoutStatus.allowed ? (
                        <div className="login-lockout-notice">
                            <strong>⚠️ Security Lockout Active</strong>
                            <p>Too many failed attempts. Try again in {lockoutStatus.remainingMinutes} minutes.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Admin Password"
                                autoFocus
                                required
                            />
                            {loginError && <div className="login-error-msg">{loginError}</div>}
                            <button type="submit" className="btn-primary">
                                <span>Authenticate</span>
                            </button>
                        </form>
                    )}

                    <button className="back-btn" onClick={() => navigate('/')}>← Return to Portfolio</button>
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
        { id: 'resume', label: '📄 Resume', count: null },
        { id: 'settings', label: '⚙️ Settings & Security', count: null }
    ];

    /* ══════════════════════════ MAIN PANEL ══════════════════════════ */
    return (
        <div className="admin-panel">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <header className="admin-header">
                <h1>📊 ZainCodes Admin Dashboard</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/projects')} className="btn-secondary"><span>Projects Showcase</span></button>
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
                        <p className="section-info">Edit the headline and value proposition that visitors see first.</p>
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
                                <label>Title / Role Positioning</label>
                                <input name="title" value={hero.title} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio / Description</label>
                                <textarea name="description" rows="4" value={hero.description} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Products Shipped</label>
                                <input name="statApps" type="number" value={hero.statApps} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input name="statYears" type="number" value={hero.statYears} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Launch Success Rate (%)</label>
                                <input name="statSatisfaction" type="number" value={hero.statSatisfaction} onChange={handleHeroChange} />
                            </div>
                            <div className="form-group">
                                <label>Profile Image / Avatar URL</label>
                                <input name="avatarUrl" value={hero.avatarUrl} onChange={handleHeroChange} />
                            </div>
                        </div>
                        <button onClick={saveHero} className="btn-primary"><span>Save Hero Changes</span></button>
                    </section>
                )}

                {/* ──────── ABOUT TAB ──────── */}
                {activeTab === 'about' && (
                    <section className="admin-section">
                        <h2>👤 About Section</h2>
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
                                <textarea name="introText" rows="5" value={about.introText} onChange={handleAboutChange} />
                            </div>
                        </div>
                        <button onClick={saveAbout} className="btn-primary"><span>Save About Changes</span></button>
                    </section>
                )}

                {/* ──────── SKILLS TAB ──────── */}
                {activeTab === 'skills' && (
                    <section className="admin-section">
                        <div className="section-header-admin">
                            <h2>⚡ Technical Competencies ({skills.length})</h2>
                            <button onClick={() => { setSkillForm({ title: '', icon: '🔥', skills: '' }); setEditingSkillCat('new'); }} className="btn-secondary">
                                <span>+ Add Category</span>
                            </button>
                        </div>
                        <div className="skills-admin-grid">
                            {skills.map((cat, idx) => (
                                <div key={idx} className="skill-cat-card">
                                    <div className="cat-header">
                                        <span className="cat-icon">{cat.icon}</span>
                                        <h3>{cat.title}</h3>
                                        <div className="cat-actions">
                                            <button onClick={() => openSkillEditor(idx)} className="btn-edit-sm">Edit</button>
                                            <button onClick={() => deleteSkillCategory(idx)} className="btn-del-sm">×</button>
                                        </div>
                                    </div>
                                    <ul className="cat-skills-list">
                                        {cat.skills.map((s, si) => (
                                            <li key={si}>
                                                <span className="skill-dot" style={{ background: s.color }} />
                                                <span className="skill-name">{s.name}</span>
                                                <span className="skill-pct">{s.level}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ──────── CONTACT TAB ──────── */}
                {activeTab === 'contact' && (
                    <section className="admin-section">
                        <h2>📞 Contact &amp; Social Information</h2>
                        <div className="admin-form-grid">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" value={contact.email} onChange={handleContactChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone / WhatsApp</label>
                                <input name="phone" value={contact.phone} onChange={handleContactChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Location</label>
                                <input name="location" value={contact.location} onChange={handleContactChange} />
                            </div>
                        </div>
                        <button onClick={saveContact} className="btn-primary"><span>Save Contact</span></button>

                        <div className="social-admin-section" style={{ marginTop: '2.5rem' }}>
                            <div className="section-header-admin">
                                <h3>🌐 Social Links</h3>
                                <button onClick={() => { setSocialForm({ name: '', icon: '🔗', url: '' }); setEditingSocial('new'); }} className="btn-secondary">
                                    <span>+ Add Social</span>
                                </button>
                            </div>
                            <div className="social-admin-list">
                                {social.map((s, idx) => (
                                    <div key={idx} className="social-admin-item">
                                        <span className="social-ico">{s.icon}</span>
                                        <span className="social-name">{s.name}</span>
                                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="social-url">{s.url}</a>
                                        <button onClick={() => { setSocialForm(s); setEditingSocial(idx); }} className="btn-edit-sm">Edit</button>
                                        <button onClick={() => deleteSocial(idx)} className="btn-del-sm">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ──────── PROJECTS TAB ──────── */}
                {activeTab === 'projects' && (
                    <section className="admin-section">
                        <div className="section-header-admin">
                            <h2>🚀 Production Projects &amp; Case Studies ({projects.length})</h2>
                            <button onClick={openAddProject} className="btn-primary"><span>+ Add New Project</span></button>
                        </div>
                        <div className="projects-list">
                            {projects.map((proj) => (
                                <div key={proj.id} className="project-card-admin">
                                    <img src={proj.thumbnail || proj.image || '/logo192.png'} alt={proj.title} />
                                    <div className="project-info-admin">
                                        <h4>{proj.title}</h4>
                                        <span className="category-badge">{proj.category}</span>
                                        <p>{proj.description}</p>
                                    </div>
                                    <div className="project-actions-admin">
                                        <button onClick={() => openEditProject(proj)} className="btn-secondary">Edit</button>
                                        <button onClick={() => deleteProject(proj.id)} className="btn-delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ──────── RESUME TAB (100% FREE UPLOAD & DOWNLOAD FLOW) ──────── */}
                {activeTab === 'resume' && (
                    <section className="admin-section">
                        <h2>📄 Resume &amp; CV Manager (100% Free)</h2>
                        <p className="section-info">
                            Upload your latest resume PDF directly from your computer. Visitors can download it with a single click from the Hero and Navigation headers.
                        </p>

                        <div className="resume-upload-card">
                            <div className="upload-dropzone">
                                <div className="dropzone-icon">📁</div>
                                <h4>{resumeFileName ? 'Replace Existing Resume' : 'Upload Resume File'}</h4>
                                <p>Supports .pdf documents (Max 4.5 MB, zero external cost)</p>

                                <label className="btn-primary file-select-btn">
                                    <span>{isUploadingResume ? 'Processing File...' : 'Choose PDF File'}</span>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleResumeUpload}
                                        disabled={isUploadingResume}
                                        hidden
                                    />
                                </label>
                            </div>

                            {/* Current File Status */}
                            {resumeFileName && (
                                <div className="current-resume-status">
                                    <div className="file-info-badge">
                                        <span className="badge-file-icon">📄</span>
                                        <div className="badge-file-details">
                                            <strong>{resumeFileName}</strong>
                                            <span>Size: {resumeFileSize || 'Stored Locally'}</span>
                                        </div>
                                    </div>

                                    <div className="resume-test-actions">
                                        <button onClick={downloadResume} className="btn-secondary" title="Test download in browser">
                                            <span>⬇️ Test Download</span>
                                        </button>
                                        <button onClick={handleRemoveResumeFile} className="btn-delete" title="Remove uploaded file">
                                            <span>Delete File</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Optional External Link Fallback */}
                        <div className="resume-url-fallback" style={{ marginTop: '2.5rem' }}>
                            <h3>🔗 Or Use External Link (Google Drive / GitHub)</h3>
                            <p className="section-info">If you prefer linking directly to a cloud document:</p>
                            <div className="resume-form">
                                <input
                                    type="url"
                                    value={resumeLink}
                                    onChange={(e) => setResumeLink(e.target.value)}
                                    placeholder="https://drive.google.com/file/d/... or raw GitHub PDF URL"
                                />
                                <button onClick={handleResumeLinkUpdate} className="btn-secondary">
                                    <span>Save Link</span>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ──────── SETTINGS & SECURITY TAB ──────── */}
                {activeTab === 'settings' && (
                    <div className="settings-grid">
                        {/* Security Master Password */}
                        <section className="admin-section">
                            <h2>🔐 Security &amp; Master Password</h2>
                            <p className="section-info">
                                Change your administrative password. It is stored as a cryptographic salted SHA-256 hash.
                            </p>
                            <form onSubmit={handlePasswordChangeSubmit} className="password-change-form">
                                <div className="admin-form-grid">
                                    <div className="form-group">
                                        <label>New Password (min. 6 chars)</label>
                                        <input
                                            type="password"
                                            value={newMasterPassword}
                                            onChange={(e) => setNewMasterPassword(e.target.value)}
                                            placeholder="Enter new master password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmMasterPassword}
                                            onChange={(e) => setConfirmMasterPassword(e.target.value)}
                                            placeholder="Confirm new master password"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                    <span>Update Master Password</span>
                                </button>
                            </form>
                        </section>

                        {/* Theme Settings */}
                        <section className="admin-section">
                            <h2>🎨 Site Theme &amp; Default Appearance</h2>
                            <div className="theme-toggle-admin">
                                <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => saveTheme('dark')}>
                                    <span className="theme-preview dark-preview" />
                                    <span>Dark Cyber Mode</span>
                                </button>
                                <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => saveTheme('light')}>
                                    <span className="theme-preview light-preview" />
                                    <span>Light Studio Mode</span>
                                </button>
                            </div>
                        </section>

                        {/* GitHub Global Sync */}
                        <section className="admin-section github-sync-settings">
                            <h2>🌐 GitHub Global Sync (Real-Time Deployment)</h2>
                            <p className="section-info">
                                Enter your Personal Access Token with repo scope. Updates will be committed directly to your repository and deployed live by Vercel.
                            </p>
                            <div className="resume-form">
                                <div className="token-input-wrapper" style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type={showGithubToken ? "text" : "password"}
                                        value={githubToken}
                                        onChange={(e) => {
                                            setGithubToken(e.target.value);
                                            localStorage.setItem('REACT_APP_GITHUB_TOKEN', e.target.value);
                                        }}
                                        placeholder="ghp_xxxxxxxxxxxx"
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGithubToken(!showGithubToken)}
                                        className="token-toggle-btn"
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                    >
                                        {showGithubToken ? '👁️' : '🔒'}
                                    </button>
                                </div>
                                <button onClick={() => triggerGlobalSync()} className="btn-primary" disabled={isSyncing || !githubToken}>
                                    <span>{isSyncing ? 'Syncing...' : 'Sync to GitHub'}</span>
                                </button>
                            </div>
                        </section>

                        {/* Backup & Restore */}
                        <section className="admin-section">
                            <h2>💾 Data Backup &amp; Restore</h2>
                            <p className="section-info">Download a full JSON backup of your portfolio database or restore from a saved copy.</p>
                            <div className="backup-actions">
                                <button onClick={handleExport} className="btn-secondary"><span>Export All Data</span></button>
                                <label className="btn-secondary import-btn">
                                    <span>Import Data</span>
                                    <input type="file" accept=".json" onChange={handleImport} hidden />
                                </label>
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
                            <div className="form-group"><label>Title</label><input name="title" value={formData.title} onChange={handleProjectFormChange} required /></div>
                            <div className="form-group"><label>Slug (URL key)</label><input name="slug" value={formData.slug} onChange={handleProjectFormChange} placeholder="my-app-name" /></div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleProjectFormChange}>
                                    <option value="android">Android Native (Kotlin/Java)</option>
                                    <option value="flutter">Flutter Cross-Platform</option>
                                    <option value="web">Web &amp; Full Stack</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>Short Summary</label><input name="description" value={formData.description} onChange={handleProjectFormChange} required /></div>
                            <div className="form-group full-width"><label>Detailed Architecture Description</label><textarea name="longDescription" rows="4" value={formData.longDescription} onChange={handleProjectFormChange} /></div>
                            <div className="form-group"><label>Image / Thumbnail URL</label><input name="image" value={formData.image} onChange={handleProjectFormChange} placeholder="/Profile.webp or https://..." /></div>
                            <div className="form-group"><label>Technologies (comma separated)</label><input name="technologies" value={formData.technologies} onChange={handleProjectFormChange} placeholder="Kotlin, Jetpack Compose, Room, Coroutines" /></div>
                            <div className="form-group"><label>Play Store / Live Demo Link</label><input name="playStoreLink" value={formData.playStoreLink} onChange={handleProjectFormChange} placeholder="https://play.google.com/..." /></div>
                            <div className="form-group"><label>GitHub Repository Link</label><input name="githubLink" value={formData.githubLink} onChange={handleProjectFormChange} placeholder="https://github.com/..." /></div>
                            <div className="form-group full-width"><label>Key Architectural Features (one per line)</label><textarea name="features" rows="3" value={formData.features} onChange={handleProjectFormChange} placeholder={"MVVM Architecture with StateFlow\nOffline-first Room Database caching"} /></div>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">Save Project</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ──────── SKILL EDITOR OVERLAY ──────── */}
            {editingSkillCat !== null && editingSkillCat !== undefined && (
                <div className="project-form-overlay">
                    <div className="project-form">
                        <div className="form-header">
                            <h3>{editingSkillCat === 'new' ? 'Add Skill Category' : 'Edit Skill Category'}</h3>
                            <button type="button" onClick={() => setEditingSkillCat(null)} className="close-btn">×</button>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label>Category Name</label><input value={skillForm.title} onChange={e => setSkillForm(p => ({ ...p, title: e.target.value }))} /></div>
                            <div className="form-group"><label>Icon (emoji)</label><input value={skillForm.icon} onChange={e => setSkillForm(p => ({ ...p, icon: e.target.value }))} /></div>
                            <div className="form-group full-width">
                                <label>Skills (one per line: <code>Name:Level:Color</code>)</label>
                                <textarea rows="8" value={skillForm.skills} onChange={e => setSkillForm(p => ({ ...p, skills: e.target.value }))} placeholder={"Android Kotlin:95:#3DDC84\nFlutter:90:#0284c7"} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setEditingSkillCat(null)} className="btn-secondary">Cancel</button>
                            <button onClick={saveSkillCategory} className="btn-primary">Save Category</button>
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
                            <button onClick={() => setEditingSocial(null)} className="btn-secondary">Cancel</button>
                            <button onClick={saveSocialItem} className="btn-primary">Save Link</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
