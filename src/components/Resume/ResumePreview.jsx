import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Printer, Sparkles, ExternalLink, Mail, Phone, MapPin, Globe } from 'lucide-react';
import './ResumePreview.css';

const LinkedinIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export default function ResumePreview({ resumeData, templateId = "modern", accentColor = "#6366f1", fontFamily = "'Inter', sans-serif" }) {
  const previewRef = useRef(null);

  const data = resumeData || {};
  const personal = data.personal || {};
  const education = data.education || [];
  const skills = data.skills || [];
  const experience = data.experience || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const achievements = data.achievements || [];
  const languages = data.languages || [];
  const interests = data.interests || [];
  const declaration = data.declaration || {};

  const handleDownloadPdf = () => {
    if (!previewRef.current) return;
    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${personal.fullName ? personal.fullName.replace(/\s+/g, '_') : 'Resume'}_LernX.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  const customStyle = {
    '--accent-color': accentColor || '#6366f1',
    fontFamily: fontFamily || "'Inter', sans-serif"
  };

  return (
    <div className="resume-preview-wrapper">
      {/* Top Action Bar */}
      <div className="preview-action-bar">
        <div className="preview-badge">
          <Sparkles className="sparkle-icon" size={16} />
          <span>Live A4 Preview ({templateId.toUpperCase()})</span>
        </div>
        <div className="preview-btn-group">
          <button className="preview-action-btn primary" onClick={handleDownloadPdf} title="Download PDF">
            <Download size={15} />
            <span>PDF</span>
          </button>
          <button className="preview-action-btn secondary" onClick={handlePrint} title="Print Resume">
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Document Wrapper */}
      <div className="a4-container">
        <div 
          ref={previewRef} 
          className={`a4-paper template-${templateId}`} 
          style={customStyle}
          id="resume-a4-document"
        >
          {/* HEADER SECTION */}
          <div className="paper-header">
            {personal.photo && templateId !== "minimal" && templateId !== "classic" && (
              <div className="header-photo-wrapper">
                <img src={personal.photo} alt={personal.fullName} className="header-photo" />
              </div>
            )}
            <div className="header-text-block">
              <h1 className="header-name">{personal.fullName || "Your Full Name"}</h1>
              <p className="header-role">{personal.role || "Target Job Role / Title"}</p>
              
              <div className="contact-meta-row">
                {personal.email && (
                  <span className="contact-item">
                    <Mail size={12} className="meta-icon" />
                    {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="contact-item">
                    <Phone size={12} className="meta-icon" />
                    {personal.phone}
                  </span>
                )}
                {personal.location && (
                  <span className="contact-item">
                    <MapPin size={12} className="meta-icon" />
                    {personal.location}
                  </span>
                )}
                {personal.linkedin && (
                  <span className="contact-item">
                    <LinkedinIcon size={12} className="meta-icon" />
                    {personal.linkedin}
                  </span>
                )}
                {personal.github && (
                  <span className="contact-item">
                    <GithubIcon size={12} className="meta-icon" />
                    {personal.github}
                  </span>
                )}
                {personal.portfolio && (
                  <span className="contact-item">
                    <Globe size={12} className="meta-icon" />
                    {personal.portfolio}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          {personal.summary && (
            <div className="paper-section">
              <h3 className="section-heading">Professional Summary</h3>
              <div className="heading-line"></div>
              <p className="summary-text">{personal.summary}</p>
            </div>
          )}

          {/* MAIN CONTENT GRID (Adapts based on template) */}
          <div className="paper-body-layout">
            
            {/* WORK EXPERIENCE */}
            {experience.length > 0 && (
              <div className="paper-section">
                <h3 className="section-heading">Work Experience</h3>
                <div className="heading-line"></div>
                <div className="timeline-list">
                  {experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="timeline-item">
                      <div className="timeline-header">
                        <div>
                          <strong className="item-title">{exp.role}</strong>
                          <span className="item-company"> — {exp.company}</span>
                        </div>
                        <span className="item-duration">{exp.duration}</span>
                      </div>
                      <p className="item-description">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {projects.length > 0 && (
              <div className="paper-section">
                <h3 className="section-heading">Key Projects</h3>
                <div className="heading-line"></div>
                <div className="projects-grid">
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="project-card-item">
                      <div className="project-header">
                        <strong className="item-title">{proj.name}</strong>
                        <div className="project-links">
                          {proj.github && <span className="p-link"><GithubIcon size={11} /> {proj.github}</span>}
                          {proj.liveLink && <span className="p-link"><ExternalLink size={11} /> {proj.liveLink}</span>}
                        </div>
                      </div>
                      <p className="item-description">{proj.description}</p>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="tech-badge-container">
                          {proj.techStack.map((tech, i) => (
                            <span key={i} className="tech-pill">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {education.length > 0 && (
              <div className="paper-section">
                <h3 className="section-heading">Education</h3>
                <div className="heading-line"></div>
                <div className="education-list">
                  {education.map((edu, idx) => (
                    <div key={edu.id || idx} className="education-item">
                      <div className="timeline-header">
                        <div>
                          <strong className="item-title">{edu.degree} in {edu.branch}</strong>
                          <div className="item-company">{edu.college}</div>
                        </div>
                        <div className="edu-dates">
                          <span>{edu.startDate} - {edu.endDate}</span>
                          {edu.cgpa && <span className="cgpa-badge">CGPA: {edu.cgpa}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKILLS */}
            {skills.length > 0 && (
              <div className="paper-section">
                <h3 className="section-heading">Skills & Competencies</h3>
                <div className="heading-line"></div>
                <div className="skills-chip-wrapper">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="preview-skill-chip">
                      {typeof skill === 'string' ? skill : skill.name}
                      {skill.level && <small className="skill-lvl">({skill.level})</small>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CERTIFICATIONS & ACHIEVEMENTS ROW */}
            {(certifications.length > 0 || achievements.length > 0) && (
              <div className="two-col-section">
                {certifications.length > 0 && (
                  <div className="paper-section col-half">
                    <h3 className="section-heading">Certifications</h3>
                    <div className="heading-line"></div>
                    <ul className="simple-bullet-list">
                      {certifications.map((c, i) => (
                        <li key={i}>
                          <strong>{c.title}</strong> — {c.issuer} ({c.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {achievements.length > 0 && (
                  <div className="paper-section col-half">
                    <h3 className="section-heading">Achievements</h3>
                    <div className="heading-line"></div>
                    <ul className="simple-bullet-list">
                      {achievements.map((a, i) => (
                        <li key={i}>
                          <strong>{a.title}</strong>: {a.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* LANGUAGES & INTERESTS */}
            {(languages.length > 0 || interests.length > 0) && (
              <div className="two-col-section">
                {languages.length > 0 && (
                  <div className="paper-section col-half">
                    <h3 className="section-heading">Languages</h3>
                    <div className="heading-line"></div>
                    <div className="lang-grid">
                      {languages.map((l, i) => (
                        <span key={i} className="lang-pill">
                          {l.name} {l.proficiency ? `(${l.proficiency})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {interests.length > 0 && (
                  <div className="paper-section col-half">
                    <h3 className="section-heading">Interests</h3>
                    <div className="heading-line"></div>
                    <div className="interests-flex">
                      {interests.map((int, i) => (
                        <span key={i} className="interest-tag">{int}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DECLARATION */}
            {declaration && declaration.text && (
              <div className="paper-section declaration-box">
                <h3 className="section-heading">Declaration</h3>
                <div className="heading-line"></div>
                <p className="declaration-text">{declaration.text}</p>
                <div className="declaration-footer">
                  <div>
                    {declaration.place && <span>Place: {declaration.place}</span>}
                    {declaration.date && <span style={{ marginLeft: 16 }}>Date: {declaration.date}</span>}
                  </div>
                  {declaration.signatureName && (
                    <div className="signature-mark">
                      <em>{declaration.signatureName}</em>
                      <small>Digitally Verified</small>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="a4-footer-watermark">
            <span>Powered by LernX Resume Engine</span>
          </div>

        </div>
      </div>
    </div>
  );
}
