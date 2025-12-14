import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const ADMIN_PASSWORD = 'zaincodes2024'; // Change this to your password

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [projects, setProjects] = useState([]);
    const [resumeLink, setResumeLink] = useState('');
    const [editingProject, setEditingProject] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'android',
        description: '',
        longDescription: '',
        thumbnail: '',
        image: '',
        technologies: '',
        features: '',
        highlights: '',
        playStoreLink: '',
        githubLink: ''
    });

    useEffect(() => {
        // Check if already authenticated
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }

        // Load projects from localStorage
        const savedProjects = localStorage.getItem('portfolioProjects');
        if (savedProjects) {
            setProjects(JSON.parse(savedProjects));
        }

        // Load resume link
        const savedResume = localStorage.getItem('resumeLink');
        if (savedResume) {
            setResumeLink(savedResume);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
        } else {
            alert('Incorrect password!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
    };

    const generateSlug = (title) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'title' ? { slug: generateSlug(value) } : {})
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const projectData = {
            id: editingProject ? editingProject.id : Date.now(),
            title: formData.title,
            slug: formData.slug || generateSlug(formData.title),
            category: formData.category,
            description: formData.description,
            longDescription: formData.longDescription,
            thumbnail: formData.thumbnail,
            image: formData.image || formData.thumbnail,
            technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t),
            features: formData.features.split(',').map(f => f.trim()).filter(f => f),
            highlights: formData.highlights.split(',').map(h => h.trim()).filter(h => h),
            playStoreLink: formData.playStoreLink || '#',
            githubLink: formData.githubLink || '#'
        };

        let updatedProjects;
        if (editingProject) {
            updatedProjects = projects.map(p => p.id === editingProject.id ? projectData : p);
        } else {
            updatedProjects = [...projects, projectData];
        }

        setProjects(updatedProjects);
        localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));

        resetForm();
        alert(editingProject ? 'Project updated!' : 'Project added!');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            category: 'android',
            description: '',
            longDescription: '',
            thumbnail: '',
            image: '',
            technologies: '',
            features: '',
            highlights: '',
            playStoreLink: '',
            githubLink: ''
        });
        setEditingProject(null);
        setShowForm(false);
    };

    const handleEdit = (project) => {
        setFormData({
            title: project.title,
            slug: project.slug,
            category: project.category,
            description: project.description,
            longDescription: project.longDescription || '',
            thumbnail: project.thumbnail,
            image: project.image || '',
            technologies: project.technologies.join(', '),
            features: project.features.join(', '),
            highlights: project.highlights ? project.highlights.join(', ') : '',
            playStoreLink: project.playStoreLink || '',
            githubLink: project.githubLink || ''
        });
        setEditingProject(project);
        setShowForm(true);
    };

    const handleDelete = (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            const updatedProjects = projects.filter(p => p.id !== projectId);
            setProjects(updatedProjects);
            localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));
        }
    };

    const handleResumeUpdate = () => {
        localStorage.setItem('resumeLink', resumeLink);
        alert('Resume link saved!');
    };

    const handleExport = () => {
        const data = {
            projects,
            resumeLink
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-data.json';
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.projects) {
                        setProjects(data.projects);
                        localStorage.setItem('portfolioProjects', JSON.stringify(data.projects));
                    }
                    if (data.resumeLink) {
                        setResumeLink(data.resumeLink);
                        localStorage.setItem('resumeLink', data.resumeLink);
                    }
                    alert('Data imported successfully!');
                } catch (err) {
                    alert('Invalid file format!');
                }
            };
            reader.readAsText(file);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <h1>🔐 Admin Panel</h1>
                    <p>Enter password to access</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                        />
                        <button type="submit" className="btn-primary">Login</button>
                    </form>
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <h1>📊 Portfolio Admin</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/')} className="btn-secondary">View Site</button>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="admin-content">
                {/* Resume Section */}
                <section className="admin-section">
                    <h2>📄 Resume Link</h2>
                    <p className="section-info">Upload your resume to Google Drive, then paste the shareable link here.</p>
                    <div className="resume-form">
                        <input
                            type="url"
                            value={resumeLink}
                            onChange={(e) => setResumeLink(e.target.value)}
                            placeholder="https://drive.google.com/your-resume-link"
                        />
                        <button onClick={handleResumeUpdate} className="btn-primary">Save Link</button>
                    </div>
                </section>

                {/* Import/Export */}
                <section className="admin-section">
                    <h2>💾 Backup & Restore</h2>
                    <p className="section-info">Export your data to keep a backup, or import from a previous backup.</p>
                    <div className="backup-actions">
                        <button onClick={handleExport} className="btn-secondary">Export Data</button>
                        <label className="btn-secondary import-btn">
                            Import Data
                            <input type="file" accept=".json" onChange={handleImport} hidden />
                        </label>
                    </div>
                </section>

                {/* Projects Section */}
                <section className="admin-section">
                    <div className="section-header-admin">
                        <h2>🚀 Projects ({projects.length})</h2>
                        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Project</button>
                    </div>

                    {showForm && (
                        <div className="project-form-overlay">
                            <form className="project-form" onSubmit={handleSubmit}>
                                <div className="form-header">
                                    <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                                    <button type="button" onClick={resetForm} className="close-btn">×</button>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Project Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>URL Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleFormChange}
                                            placeholder="auto-generated"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select name="category" value={formData.category} onChange={handleFormChange}>
                                            <option value="android">Android</option>
                                            <option value="flutter">Flutter</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Thumbnail URL * (use imgbb.com)</label>
                                        <input
                                            type="url"
                                            name="thumbnail"
                                            value={formData.thumbnail}
                                            onChange={handleFormChange}
                                            placeholder="https://i.ibb.co/..."
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Short Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows="2"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Long Description</label>
                                        <textarea
                                            name="longDescription"
                                            value={formData.longDescription}
                                            onChange={handleFormChange}
                                            rows="4"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Technologies (comma separated) *</label>
                                        <input
                                            type="text"
                                            name="technologies"
                                            value={formData.technologies}
                                            onChange={handleFormChange}
                                            placeholder="Kotlin, Android, Firebase, MVVM"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Features (comma separated)</label>
                                        <input
                                            type="text"
                                            name="features"
                                            value={formData.features}
                                            onChange={handleFormChange}
                                            placeholder="User Auth, Real-time Chat, Push Notifications"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Play Store Link</label>
                                        <input
                                            type="url"
                                            name="playStoreLink"
                                            value={formData.playStoreLink}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>GitHub Link</label>
                                        <input
                                            type="url"
                                            name="githubLink"
                                            value={formData.githubLink}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary">
                                        {editingProject ? 'Update Project' : 'Add Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="projects-list">
                        {projects.length === 0 ? (
                            <p className="no-projects">No projects yet. Click "Add Project" to get started!</p>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="project-card-admin">
                                    <img src={project.thumbnail} alt={project.title} />
                                    <div className="project-info-admin">
                                        <h4>{project.title}</h4>
                                        <span className="category-badge">{project.category}</span>
                                        <p>{project.description}</p>
                                    </div>
                                    <div className="project-actions">
                                        <button onClick={() => handleEdit(project)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(project.id)} className="btn-delete">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminPanel;
