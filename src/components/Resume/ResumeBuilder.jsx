import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutTemplate, Palette, Type, Check, CheckCircle2 } from 'lucide-react';
import ResumeFormAccordion from './ResumeFormAccordion';
import ResumePreview from './ResumePreview';
import { INITIAL_RESUME_DATA, RESUME_TEMPLATES, ACCENT_COLORS, FONT_OPTIONS } from './dummyData';
import './ResumeBuilder.css';

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplateParam = searchParams.get('template') || 'modern';

  // State management
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('lernx_active_resume');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, template: initialTemplateParam || parsed.template || 'modern' };
      } catch (e) {
        console.error(e);
      }
    }
    return { ...INITIAL_RESUME_DATA, template: initialTemplateParam };
  });

  const [activeTemplate, setActiveTemplate] = useState(initialTemplateParam);
  const [accentColor, setAccentColor] = useState(resumeData.accentColor || '#6366f1');
  const [fontFamily, setFontFamily] = useState(resumeData.fontFamily || "'Inter', sans-serif");
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Auto-save changes to localStorage
  useEffect(() => {
    setSaveStatus('Saving...');
    const timeout = setTimeout(() => {
      const updated = {
        ...resumeData,
        template: activeTemplate,
        accentColor,
        fontFamily,
        updatedAt: 'Just now'
      };
      localStorage.setItem('lernx_active_resume', JSON.stringify(updated));
      setSaveStatus('Saved');
    }, 600);

    return () => clearTimeout(timeout);
  }, [resumeData, activeTemplate, accentColor, fontFamily]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="resume-builder-page"
    >
      {/* TOP BUILDER TOOLBAR */}
      <div className="builder-top-bar">
        <div className="bar-left-group">
          <button className="btn-back-link" onClick={() => navigate('/resume')}>
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>

          <div className="builder-title-badge">
            <input 
              type="text" 
              value={resumeData.title || 'My Resume'} 
              onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
              className="builder-title-input" 
            />
            <span className="save-status-pill">
              <CheckCircle2 size={13} className="status-icon" />
              {saveStatus}
            </span>
          </div>
        </div>

        {/* CUSTOMIZATION TOOLBAR CONTROLS */}
        <div className="bar-controls-group">
          
          {/* Template Selector */}
          <div className="control-item">
            <LayoutTemplate size={16} className="control-icon" />
            <select 
              value={activeTemplate} 
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="glass-select"
            >
              {RESUME_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Accent Picker */}
          <div className="control-item colors-dropdown">
            <Palette size={16} className="control-icon" />
            <div className="color-swatches-inline">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`color-dot-btn ${accentColor === c.value ? 'active' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setAccentColor(c.value)}
                  title={c.name}
                >
                  {accentColor === c.value && <Check size={10} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="control-item">
            <Type size={16} className="control-icon" />
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className="glass-select"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.name} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* SPLIT VIEW MAIN CONTAINER */}
      <div className="builder-split-container">
        
        {/* LEFT FORM SIDE */}
        <div className="builder-form-pane">
          <div className="pane-header">
            <h3>Form Sections</h3>
            <p>Fill in your details below. Preview updates live in real-time.</p>
          </div>
          <ResumeFormAccordion resumeData={resumeData} onChange={setResumeData} />
        </div>

        {/* RIGHT LIVE PREVIEW SIDE */}
        <div className="builder-preview-pane">
          <ResumePreview 
            resumeData={resumeData} 
            templateId={activeTemplate} 
            accentColor={accentColor}
            fontFamily={fontFamily}
          />
        </div>

      </div>
    </motion.div>
  );
}
