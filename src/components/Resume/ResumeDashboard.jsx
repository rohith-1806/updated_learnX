import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FilePlus, FolderKanban, ShieldCheck, LayoutTemplate, 
  Sparkles, FileText, ArrowRight, Trash2, Edit3, Copy, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_RESUME_DATA } from './dummyData';
import './ResumeDashboard.css';

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || user?.username || 'Rohith';

  const [resumes, setResumes] = useState(() => {
    const saved = localStorage.getItem('lernx_saved_resumes_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default initial mock resume
    return [INITIAL_RESUME_DATA];
  });

  useEffect(() => {
    localStorage.setItem('lernx_saved_resumes_list', JSON.stringify(resumes));
  }, [resumes]);

  const handleCreateNew = () => {
    const newResume = {
      ...INITIAL_RESUME_DATA,
      id: `resume-${Date.now()}`,
      title: 'New Professional Resume',
      updatedAt: 'Just now'
    };
    const updated = [newResume, ...resumes];
    setResumes(updated);
    localStorage.setItem('lernx_active_resume', JSON.stringify(newResume));
    navigate('/resume/builder');
  };

  const handleEditResume = (res) => {
    localStorage.setItem('lernx_active_resume', JSON.stringify(res));
    navigate('/resume/builder');
  };

  const handleDuplicateResume = (res, e) => {
    e.stopPropagation();
    const dup = {
      ...res,
      id: `resume-${Date.now()}`,
      title: `${res.title} (Copy)`,
      updatedAt: 'Just now'
    };
    setResumes([dup, ...resumes]);
  };

  const handleDeleteResume = (id, e) => {
    e.stopPropagation();
    setResumes(resumes.filter((r) => r.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="resume-dashboard-container"
    >
      {/* BACKGROUND FLOATING BLOBS */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* PAGE HERO HEADER */}
      <div className="resume-hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="sparkle-gold" />
            <span>LernX Resume Builder Studio</span>
          </div>
          <h1 className="hero-greeting">
            Welcome back, <span className="highlight-name">{userName}</span> 👋
          </h1>
          <p className="hero-subtitle">
            Let's build a professional resume that stands out to recruiters and passes ATS scanners.
          </p>
        </div>

        {/* RIGHT ANIMATED DOCUMENT ILLUSTRATION */}
        <div className="hero-illustration-wrapper">
          <div className="glass-document-card">
            <div className="doc-line header"></div>
            <div className="doc-line subheader"></div>
            <div className="doc-block"></div>
            <div className="doc-block"></div>
            <div className="doc-floating-chip">
              <ShieldCheck size={14} color="#10b981" /> 95% ATS Score
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION CARDS */}
      <div className="quick-actions-grid">
        
        {/* CARD 1: CREATE RESUME */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="action-glass-card primary-gradient"
          onClick={handleCreateNew}
        >
          <div className="action-icon-box">
            <FilePlus size={26} />
          </div>
          <div className="action-card-text">
            <h3>Create Resume</h3>
            <p>Create a professional ATS-friendly resume from scratch.</p>
          </div>
          <button className="btn-action-trigger gradient">
            <span>Start Building</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* CARD 2: MY RESUMES */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="action-glass-card"
          onClick={() => {
            const el = document.getElementById('my-resumes-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="action-card-top flex-space">
            <div className="action-icon-box cyan">
              <FolderKanban size={26} />
            </div>
            <span className="count-badge-pill">{resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}</span>
          </div>
          <div className="action-card-text">
            <h3>My Resumes</h3>
            <p>Manage and customize your saved drafts and versions.</p>
          </div>
          <button className="btn-action-trigger outline">
            <span>Open List</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* CARD 3: ATS CHECKER */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="action-glass-card"
          onClick={() => navigate('/resume/ats')}
        >
          <div className="action-icon-box green">
            <ShieldCheck size={26} />
          </div>
          <div className="action-card-text">
            <h3>ATS Checker</h3>
            <p>Analyze your resume for ATS compatibility & score.</p>
          </div>
          <button className="btn-action-trigger outline">
            <span>Check Resume</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* CARD 4: TEMPLATES */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="action-glass-card"
          onClick={() => navigate('/resume/templates')}
        >
          <div className="action-icon-box purple">
            <LayoutTemplate size={26} />
          </div>
          <div className="action-card-text">
            <h3>Templates</h3>
            <p>Explore premium resume templates for top roles.</p>
          </div>
          <button className="btn-action-trigger outline">
            <span>Browse</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

      </div>

      {/* MY RESUMES SECTION & EMPTY STATES */}
      <div id="my-resumes-section" className="my-resumes-container">
        <div className="section-title-row">
          <div>
            <h2>My Resumes</h2>
            <p>Select a resume to edit, preview, or analyze.</p>
          </div>
          <button className="btn-create-small" onClick={handleCreateNew}>
            <Plus size={16} /> New Resume
          </button>
        </div>

        {/* EMPTY STATE */}
        {resumes.length === 0 ? (
          <div className="empty-state-glass">
            <div className="empty-icon-circle">
              <FileText size={42} className="empty-icon" />
            </div>
            <h3>You haven't created a resume yet.</h3>
            <p>Get started by creating a stunning ATS-optimized resume in under 5 minutes.</p>
            <button className="btn-empty-create" onClick={handleCreateNew}>
              <FilePlus size={18} /> Create Resume
            </button>
          </div>
        ) : (
          /* RESUME CARDS GRID */
          <div className="resumes-list-grid">
            {resumes.map((res) => (
              <motion.div 
                key={res.id} 
                whileHover={{ y: -4 }}
                className="resume-item-glass-card"
                onClick={() => handleEditResume(res)}
              >
                <div className="resume-card-preview-mini">
                  <FileText size={32} className="card-doc-icon" />
                  <span className="tmpl-tag">{res.template ? res.template.toUpperCase() : 'MODERN'}</span>
                </div>

                <div className="resume-card-body">
                  <div className="card-title-row">
                    <h4>{res.title}</h4>
                    {res.atsScore && <span className="ats-score-chip">{res.atsScore}% ATS</span>}
                  </div>
                  <p className="card-role">{res.personal?.role || 'Full Stack Engineer'}</p>
                  <span className="card-date">Updated: {res.updatedAt}</span>

                  <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                    <button className="card-act-btn edit" onClick={() => handleEditResume(res)} title="Edit Resume">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button className="card-act-btn dup" onClick={(e) => handleDuplicateResume(res, e)} title="Duplicate">
                      <Copy size={14} /> Duplicate
                    </button>
                    <button className="card-act-btn del" onClick={(e) => handleDeleteResume(res.id, e)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}
