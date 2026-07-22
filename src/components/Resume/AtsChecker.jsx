import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle2, Sparkles, ArrowLeft, 
  RefreshCw, Edit, Check, X, Cpu
} from 'lucide-react';
import { ATS_MOCK_REPORT } from './dummyData';
import './AtsChecker.css';

const LOADING_MESSAGES = [
  "Analyzing your resume...",
  "Checking ATS compatibility...",
  "Reading skills...",
  "Checking project quality...",
  "Evaluating experience...",
  "Finding missing keywords...",
  "Optimizing resume structure...",
  "Checking formatting...",
  "Calculating ATS Score...",
  "Almost done..."
];

export default function AtsChecker() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [report, setReport] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Cycling loading messages every 2s during analysis
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => {
          if (prev < LOADING_MESSAGES.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1600);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleStartAnalysis = (fileName = "Sample_Resume_Rohith.pdf") => {
    setUploadedFile(fileName);
    setIsLoading(true);
    setReport(null);

    // Complete loading after ~7 seconds
    setTimeout(() => {
      setIsLoading(false);
      setReport(ATS_MOCK_REPORT);
    }, 6500);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleStartAnalysis(file.name);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleStartAnalysis(e.target.files[0].name);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className="ats-checker-page"
    >
      {/* HEADER */}
      <div className="ats-header">
        <button className="btn-back-link" onClick={() => navigate('/resume')}>
          <ArrowLeft size={18} />
          <span>Resume Hub</span>
        </button>

        <div className="ats-title-box">
          <div className="ats-badge">
            <Cpu size={14} className="cpu-icon" />
            <span>AI Resume Scanner</span>
          </div>
          <h1>ATS Resume Compatibility Checker</h1>
          <p>Scan your resume against real applicant tracking systems to score keywords, structure, and readability.</p>
        </div>
      </div>

      {/* UPLOAD & LOADING SECTION */}
      {!report && (
        <div className="ats-upload-section">
          <div 
            className={`ats-dropzone-card ${dragOver ? 'drag-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <div className="upload-icon-wrapper">
              <Upload size={38} className="upload-icon" />
            </div>
            
            <h3>Upload Resume to Scan</h3>
            <p>Drag and drop your PDF or DOCX file here, or click to browse.</p>
            
            <div className="upload-btn-row">
              <label htmlFor="ats-file-input" className="btn-upload-primary">
                <FileText size={16} /> Choose File
              </label>
              <input 
                id="ats-file-input" 
                type="file" 
                accept=".pdf,.docx,.doc" 
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <button className="btn-upload-sample" onClick={() => handleStartAnalysis()}>
                <Sparkles size={16} /> Scan Sample Resume
              </button>
            </div>

            <div className="supported-formats">
              <span>Supported formats: <strong>PDF, DOCX</strong> (Max size: 10MB)</span>
            </div>
          </div>

          {/* PREMIUM ATS LOADING OVERLAY */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="ats-loading-overlay"
              >
                <div className="glass-loading-card">
                  
                  {/* Glowing Circular Progress Loader */}
                  <div className="circular-loader-wrapper">
                    <div className="glowing-spinner"></div>
                    <Sparkles size={28} className="spinner-center-icon" />
                  </div>

                  {/* Cycling Text Message with Fade */}
                  <div className="loading-message-box">
                    <AnimatePresence mode="wait">
                      <motion.h4
                        key={loadingMsgIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                        className="loading-text"
                      >
                        {LOADING_MESSAGES[loadingMsgIdx]}
                      </motion.h4>
                    </AnimatePresence>
                    <p className="loading-subtext">Checking against 50+ hiring ATS criteria</p>
                  </div>

                  <div className="loading-progress-bar-track">
                    <div 
                      className="loading-progress-fill" 
                      style={{ width: `${((loadingMsgIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
                    ></div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ATS RESULT DASHBOARD */}
      {report && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ats-results-dashboard"
        >
          {/* TOP SCORE OVERVIEW BANNER */}
          <div className="ats-score-banner-card">
            
            {/* Left: Score Circle */}
            <div className="score-circle-container">
              <svg className="score-circle-svg" viewBox="0 0 160 160">
                <circle className="circle-bg" cx="80" cy="80" r="70" />
                <circle 
                  className="circle-fill" 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  style={{ strokeDashoffset: 440 - (440 * report.score) / 100 }}
                />
              </svg>
              <div className="score-value-text">
                <span className="number">{report.score}%</span>
                <span className="label">ATS Score</span>
              </div>
            </div>

            {/* Middle: Summary */}
            <div className="score-summary-text">
              <div className="status-badge-tag">
                <CheckCircle2 size={16} />
                <span>{report.status}</span>
              </div>
              <h2>Great Job! Your Resume is 82% Compatible</h2>
              <p>{report.summary}</p>

              <div className="action-buttons-flex">
                <button className="btn-ats-action primary" onClick={() => navigate('/resume/builder')}>
                  <Edit size={16} /> Edit Resume in Builder
                </button>
                <button className="btn-ats-action secondary" onClick={() => handleStartAnalysis(uploadedFile)}>
                  <RefreshCw size={16} /> Recheck ATS
                </button>
              </div>
            </div>

          </div>

          {/* MAIN ANALYSIS CONTENT GRID */}
          <div className="ats-analysis-grid">
            
            {/* LEFT COLUMN: CATEGORY SCORE BREAKDOWN */}
            <div className="glass-panel-box category-scores-pane">
              <h3>Category Scores Breakdown</h3>
              <div className="progress-bars-list">
                {Object.entries(report.scores).map(([category, scoreValue]) => {
                  let colorClass = 'green';
                  if (scoreValue < 80) colorClass = 'amber';
                  if (scoreValue < 70) colorClass = 'red';

                  return (
                    <div key={category} className="score-bar-row">
                      <div className="score-label-row">
                        <span className="cat-name">{category.charAt(0).toUpperCase() + category.slice(1)} Score</span>
                        <span className={`cat-val ${colorClass}`}>{scoreValue}%</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className={`bar-fill ${colorClass}`} 
                          style={{ width: `${scoreValue}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: IMPROVEMENT SUGGESTIONS & KEYWORDS */}
            <div className="ats-right-column">
              
              {/* SUGGESTIONS CARDS */}
              <div className="glass-panel-box suggestions-pane">
                <h3>Priority Improvement Suggestions</h3>
                <div className="suggestions-list">
                  {report.suggestions.map((sug) => {
                    let badgeColor = 'high';
                    if (sug.priority === 'Medium') badgeColor = 'medium';
                    if (sug.priority === 'Low') badgeColor = 'low';

                    return (
                      <div key={sug.id} className="suggestion-card">
                        <div className="sug-header">
                          <strong className="sug-title">{sug.title}</strong>
                          <span className={`priority-tag ${badgeColor}`}>{sug.priority} Priority</span>
                        </div>
                        <p className="sug-desc">{sug.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KEYWORDS COMPARISON */}
              <div className="glass-panel-box keywords-pane">
                <h3>Keywords Analysis</h3>
                
                <div className="kw-group">
                  <span className="kw-title green">
                    <Check size={16} /> Keywords Found ({report.keywordsFound.length})
                  </span>
                  <div className="kw-chips-flex">
                    {report.keywordsFound.map((kw, i) => (
                      <span key={i} className="kw-chip found">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="kw-group" style={{ marginTop: 20 }}>
                  <span className="kw-title red">
                    <X size={16} /> Recommended Missing Keywords ({report.keywordsMissing.length})
                  </span>
                  <div className="kw-chips-flex">
                    {report.keywordsMissing.map((kw, i) => (
                      <span key={i} className="kw-chip missing">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
