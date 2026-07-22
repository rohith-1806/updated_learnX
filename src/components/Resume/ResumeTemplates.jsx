import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Eye } from 'lucide-react';
import { RESUME_TEMPLATES } from './dummyData';
import './ResumeTemplates.css';

export default function ResumeTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const handleSelectTemplate = (id) => {
    setSelectedTemplate(id);
    navigate(`/resume/builder?template=${id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="templates-page-container"
    >
      {/* HEADER SECTION */}
      <div className="templates-header">
        <button className="btn-back-link" onClick={() => navigate('/resume')}>
          <ArrowLeft size={18} />
          <span>Back to Resume Hub</span>
        </button>

        <div className="templates-title-block">
          <div className="badge-pill">
            <Sparkles size={14} className="sparkle-accent" />
            <span>8 Production-Ready Formats</span>
          </div>
          <h1>Explore Premium Resume Templates</h1>
          <p>Choose an ATS-optimized, modern glass template crafted for recruiters and top tech companies.</p>
        </div>
      </div>

      {/* TEMPLATES GRID */}
      <div className="templates-grid">
        {RESUME_TEMPLATES.map((tmpl, idx) => {
          const isSelected = selectedTemplate === tmpl.id;

          return (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`template-card-glass ${isSelected ? 'is-selected' : ''}`}
            >
              {/* Selected Badge Indicator */}
              {isSelected && (
                <div className="selected-indicator-badge">
                  <Check size={14} /> Active
                </div>
              )}

              {/* Template Preview Graphic Mockup */}
              <div className="template-preview-canvas" style={{ background: tmpl.previewBg }}>
                <div className="mockup-paper-mini">
                  <div className="mini-line title-line"></div>
                  <div className="mini-line sub-line"></div>
                  <div className="mini-block"></div>
                  <div className="mini-block"></div>
                  <div className="mini-block"></div>
                </div>

                <div className="hover-overlay-btn">
                  <button 
                    className="btn-use-template"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                  >
                    <Eye size={16} /> Use Template
                  </button>
                </div>
              </div>

              {/* Template Details */}
              <div className="template-info-box">
                <div className="template-meta-top">
                  <span className="tmpl-category">{tmpl.category}</span>
                  <span className="tmpl-tag-badge">{tmpl.badge}</span>
                </div>
                <h3 className="tmpl-name">{tmpl.name}</h3>
                <p className="tmpl-desc">{tmpl.description}</p>
                
                <button 
                  className={`btn-select-tmpl ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                >
                  {isSelected ? (
                    <>
                      <Check size={16} /> Template Selected
                    </>
                  ) : (
                    'Select Template'
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
