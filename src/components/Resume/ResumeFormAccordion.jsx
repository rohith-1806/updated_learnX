import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, Code, Briefcase, FolderGit2, 
  Award, Trophy, Languages, Heart, ShieldCheck, ChevronDown, Plus, Trash2, Upload
} from 'lucide-react';
import './ResumeFormAccordion.css';

export default function ResumeFormAccordion({ resumeData, onChange }) {
  const [openSection, setOpenSection] = useState('personal');

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...resumeData,
      personal: {
        ...resumeData.personal,
        [name]: value
      }
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...resumeData,
          personal: {
            ...resumeData.personal,
            photo: reader.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Generic Array handlers
  const handleArrayItemChange = (sectionKey, index, field, value) => {
    const updated = [...(resumeData[sectionKey] || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resumeData, [sectionKey]: updated });
  };

  const addArrayItem = (sectionKey, defaultItem) => {
    const updated = [...(resumeData[sectionKey] || []), defaultItem];
    onChange({ ...resumeData, [sectionKey]: updated });
  };

  const removeArrayItem = (sectionKey, index) => {
    const updated = (resumeData[sectionKey] || []).filter((_, i) => i !== index);
    onChange({ ...resumeData, [sectionKey]: updated });
  };

  // Skill Add & Remove
  const [newSkillText, setNewSkillText] = useState('');
  const addSkillChip = () => {
    if (!newSkillText.trim()) return;
    const updatedSkills = [...(resumeData.skills || []), { name: newSkillText.trim(), level: 'Advanced' }];
    onChange({ ...resumeData, skills: updatedSkills });
    setNewSkillText('');
  };

  const removeSkillChip = (idx) => {
    const updatedSkills = (resumeData.skills || []).filter((_, i) => i !== idx);
    onChange({ ...resumeData, skills: updatedSkills });
  };

  // Interest Add & Remove
  const [newInterestText, setNewInterestText] = useState('');
  const addInterestChip = () => {
    if (!newInterestText.trim()) return;
    const updated = [...(resumeData.interests || []), newInterestText.trim()];
    onChange({ ...resumeData, interests: updated });
    setNewInterestText('');
  };

  const removeInterestChip = (idx) => {
    const updated = (resumeData.interests || []).filter((_, i) => i !== idx);
    onChange({ ...resumeData, interests: updated });
  };

  const sections = [
    { id: 'personal', title: '1. Personal Information', icon: User },
    { id: 'education', title: '2. Education', icon: GraduationCap },
    { id: 'skills', title: '3. Skills', icon: Code },
    { id: 'experience', title: '4. Experience', icon: Briefcase },
    { id: 'projects', title: '5. Projects', icon: FolderGit2 },
    { id: 'certifications', title: '6. Certifications', icon: Award },
    { id: 'achievements', title: '7. Achievements', icon: Trophy },
    { id: 'languages', title: '8. Languages', icon: Languages },
    { id: 'interests', title: '9. Interests', icon: Heart },
    { id: 'declaration', title: '10. Declaration', icon: ShieldCheck }
  ];

  return (
    <div className="resume-accordion-container">
      {sections.map((sec) => {
        const IconComponent = sec.icon;
        const isOpen = openSection === sec.id;

        return (
          <div key={sec.id} className={`glass-accordion-item ${isOpen ? 'is-open' : ''}`}>
            {/* Accordion Header */}
            <button 
              className="accordion-header-btn"
              onClick={() => toggleSection(sec.id)}
              type="button"
            >
              <div className="accordion-title-group">
                <div className="accordion-icon-box">
                  <IconComponent size={18} />
                </div>
                <span className="accordion-title-text">{sec.title}</span>
              </div>
              <ChevronDown className={`accordion-chevron ${isOpen ? 'rotate-180' : ''}`} size={18} />
            </button>

            {/* Accordion Body */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="accordion-body-wrapper"
                >
                  <div className="accordion-content-inner">

                    {/* 1. PERSONAL INFORMATION */}
                    {sec.id === 'personal' && (
                      <div className="form-grid">
                        <div className="form-group full-width photo-upload-box">
                          <label className="form-label">Profile Photo</label>
                          <div className="photo-preview-flex">
                            {resumeData.personal?.photo ? (
                              <img src={resumeData.personal.photo} alt="Avatar" className="form-avatar-preview" />
                            ) : (
                              <div className="form-avatar-placeholder">
                                <User size={24} />
                              </div>
                            )}
                            <label htmlFor="photo-input" className="btn-glass-upload">
                              <Upload size={14} /> Upload Image
                            </label>
                            <input 
                              id="photo-input" 
                              type="file" 
                              accept="image/*" 
                              onChange={handlePhotoUpload} 
                              style={{ display: 'none' }} 
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input 
                            type="text" 
                            name="fullName" 
                            value={resumeData.personal?.fullName || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="e.g. Rohith Kumar" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Target Role / Title *</label>
                          <input 
                            type="text" 
                            name="role" 
                            value={resumeData.personal?.role || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="e.g. Senior Full Stack Engineer" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email Address *</label>
                          <input 
                            type="email" 
                            name="email" 
                            value={resumeData.personal?.email || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="rohith@example.com" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone Number *</label>
                          <input 
                            type="text" 
                            name="phone" 
                            value={resumeData.personal?.phone || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="+91 98765 43210" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Location</label>
                          <input 
                            type="text" 
                            name="location" 
                            value={resumeData.personal?.location || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="Bengaluru, India" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">LinkedIn URL</label>
                          <input 
                            type="text" 
                            name="linkedin" 
                            value={resumeData.personal?.linkedin || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="linkedin.com/in/rohith" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">GitHub URL</label>
                          <input 
                            type="text" 
                            name="github" 
                            value={resumeData.personal?.github || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="github.com/rohith" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Portfolio URL</label>
                          <input 
                            type="text" 
                            name="portfolio" 
                            value={resumeData.personal?.portfolio || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="rohith-dev.io" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">Professional Summary</label>
                          <textarea 
                            name="summary" 
                            rows={3} 
                            value={resumeData.personal?.summary || ''} 
                            onChange={handlePersonalChange} 
                            placeholder="Briefly describe your career focus, top achievements, and engineering impact..." 
                            className="form-textarea" 
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. EDUCATION */}
                    {sec.id === 'education' && (
                      <div className="array-section-flow">
                        {(resumeData.education || []).map((edu, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Education #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('education', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">College / University</label>
                                <input 
                                  type="text" 
                                  value={edu.college || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'college', e.target.value)} 
                                  placeholder="e.g. IIT Bengaluru" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">Degree</label>
                                <input 
                                  type="text" 
                                  value={edu.degree || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'degree', e.target.value)} 
                                  placeholder="e.g. B.Tech" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">Branch / Major</label>
                                <input 
                                  type="text" 
                                  value={edu.branch || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'branch', e.target.value)} 
                                  placeholder="e.g. Computer Science" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">CGPA / Percentage</label>
                                <input 
                                  type="text" 
                                  value={edu.cgpa || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'cgpa', e.target.value)} 
                                  placeholder="e.g. 9.2 / 10" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input 
                                  type="text" 
                                  value={edu.startDate || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'startDate', e.target.value)} 
                                  placeholder="2019-08" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input 
                                  type="text" 
                                  value={edu.endDate || ''} 
                                  onChange={(e) => handleArrayItemChange('education', idx, 'endDate', e.target.value)} 
                                  placeholder="2023-05" 
                                  className="form-input" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('education', { college: '', degree: '', branch: '', cgpa: '', startDate: '', endDate: '' })}
                        >
                          <Plus size={16} /> Add Education
                        </button>
                      </div>
                    )}

                    {/* 3. SKILLS */}
                    {sec.id === 'skills' && (
                      <div className="skills-section-box">
                        <label className="form-label">Add Tech Stack & Skills</label>
                        <div className="skill-input-add-row">
                          <input 
                            type="text" 
                            value={newSkillText} 
                            onChange={(e) => setNewSkillText(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillChip())}
                            placeholder="Type a skill (e.g. React, Docker, Python)..." 
                            className="form-input" 
                          />
                          <button type="button" onClick={addSkillChip} className="btn-add-chip">
                            <Plus size={16} /> Add
                          </button>
                        </div>

                        <div className="skill-chips-display">
                          {(resumeData.skills || []).map((sk, idx) => {
                            const name = typeof sk === 'string' ? sk : sk.name;
                            return (
                              <span key={idx} className="interactive-skill-chip">
                                {name}
                                <button type="button" onClick={() => removeSkillChip(idx)} className="chip-remove-btn">
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. EXPERIENCE */}
                    {sec.id === 'experience' && (
                      <div className="array-section-flow">
                        {(resumeData.experience || []).map((exp, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Experience #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('experience', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input 
                                  type="text" 
                                  value={exp.company || ''} 
                                  onChange={(e) => handleArrayItemChange('experience', idx, 'company', e.target.value)} 
                                  placeholder="TechNova Inc." 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">Role / Job Title</label>
                                <input 
                                  type="text" 
                                  value={exp.role || ''} 
                                  onChange={(e) => handleArrayItemChange('experience', idx, 'role', e.target.value)} 
                                  placeholder="Lead Frontend Engineer" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group full-width">
                                <label className="form-label">Duration</label>
                                <input 
                                  type="text" 
                                  value={exp.duration || ''} 
                                  onChange={(e) => handleArrayItemChange('experience', idx, 'duration', e.target.value)} 
                                  placeholder="Jan 2023 - Present" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group full-width">
                                <label className="form-label">Description & Achievements</label>
                                <textarea 
                                  rows={3} 
                                  value={exp.description || ''} 
                                  onChange={(e) => handleArrayItemChange('experience', idx, 'description', e.target.value)} 
                                  placeholder="• Spearheaded feature development...\n• Improved system performance by 40%..." 
                                  className="form-textarea" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', description: '' })}
                        >
                          <Plus size={16} /> Add Experience
                        </button>
                      </div>
                    )}

                    {/* 5. PROJECTS */}
                    {sec.id === 'projects' && (
                      <div className="array-section-flow">
                        {(resumeData.projects || []).map((proj, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Project #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('projects', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="form-grid">
                              <div className="form-group full-width">
                                <label className="form-label">Project Name</label>
                                <input 
                                  type="text" 
                                  value={proj.name || ''} 
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'name', e.target.value)} 
                                  placeholder="LernX EdTech SaaS Platform" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <textarea 
                                  rows={2} 
                                  value={proj.description || ''} 
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'description', e.target.value)} 
                                  placeholder="Engineered scalable learning platform..." 
                                  className="form-textarea" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">GitHub Link</label>
                                <input 
                                  type="text" 
                                  value={proj.github || ''} 
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'github', e.target.value)} 
                                  placeholder="github.com/user/repo" 
                                  className="form-input" 
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">Live Demo Link</label>
                                <input 
                                  type="text" 
                                  value={proj.liveLink || ''} 
                                  onChange={(e) => handleArrayItemChange('projects', idx, 'liveLink', e.target.value)} 
                                  placeholder="my-project.vercel.app" 
                                  className="form-input" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('projects', { name: '', description: '', techStack: ['React', 'Node'], github: '', liveLink: '' })}
                        >
                          <Plus size={16} /> Add Project
                        </button>
                      </div>
                    )}

                    {/* 6. CERTIFICATIONS */}
                    {sec.id === 'certifications' && (
                      <div className="array-section-flow">
                        {(resumeData.certifications || []).map((cert, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Certification #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('certifications', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">Certification Title</label>
                                <input 
                                  type="text" 
                                  value={cert.title || ''} 
                                  onChange={(e) => handleArrayItemChange('certifications', idx, 'title', e.target.value)} 
                                  placeholder="AWS Solutions Architect" 
                                  className="form-input" 
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Issuer</label>
                                <input 
                                  type="text" 
                                  value={cert.issuer || ''} 
                                  onChange={(e) => handleArrayItemChange('certifications', idx, 'issuer', e.target.value)} 
                                  placeholder="Amazon Web Services" 
                                  className="form-input" 
                                />
                              </div>
                              <div className="form-group full-width">
                                <label className="form-label">Year / Date</label>
                                <input 
                                  type="text" 
                                  value={cert.year || ''} 
                                  onChange={(e) => handleArrayItemChange('certifications', idx, 'year', e.target.value)} 
                                  placeholder="2023" 
                                  className="form-input" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('certifications', { title: '', issuer: '', year: '' })}
                        >
                          <Plus size={16} /> Add Certification
                        </button>
                      </div>
                    )}

                    {/* 7. ACHIEVEMENTS */}
                    {sec.id === 'achievements' && (
                      <div className="array-section-flow">
                        {(resumeData.achievements || []).map((ach, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Achievement #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('achievements', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="form-grid">
                              <div className="form-group full-width">
                                <label className="form-label">Achievement Title</label>
                                <input 
                                  type="text" 
                                  value={ach.title || ''} 
                                  onChange={(e) => handleArrayItemChange('achievements', idx, 'title', e.target.value)} 
                                  placeholder="1st Place Winner National Hackathon" 
                                  className="form-input" 
                                />
                              </div>
                              <div className="form-group full-width">
                                <label className="form-label">Details</label>
                                <textarea 
                                  rows={2} 
                                  value={ach.description || ''} 
                                  onChange={(e) => handleArrayItemChange('achievements', idx, 'description', e.target.value)} 
                                  placeholder="Brief details about the accomplishment..." 
                                  className="form-textarea" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('achievements', { title: '', description: '' })}
                        >
                          <Plus size={16} /> Add Achievement
                        </button>
                      </div>
                    )}

                    {/* 8. LANGUAGES */}
                    {sec.id === 'languages' && (
                      <div className="array-section-flow">
                        {(resumeData.languages || []).map((lang, idx) => (
                          <div key={idx} className="array-card-item">
                            <div className="array-card-header">
                              <span className="card-badge">Language #{idx + 1}</span>
                              <button 
                                type="button" 
                                className="btn-icon-danger"
                                onClick={() => removeArrayItem('languages', idx)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="form-grid">
                              <div className="form-group">
                                <label className="form-label">Language</label>
                                <input 
                                  type="text" 
                                  value={lang.name || ''} 
                                  onChange={(e) => handleArrayItemChange('languages', idx, 'name', e.target.value)} 
                                  placeholder="e.g. English" 
                                  className="form-input" 
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Proficiency</label>
                                <input 
                                  type="text" 
                                  value={lang.proficiency || ''} 
                                  onChange={(e) => handleArrayItemChange('languages', idx, 'proficiency', e.target.value)} 
                                  placeholder="Native / Fluent / Intermediate" 
                                  className="form-input" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="btn-add-item"
                          onClick={() => addArrayItem('languages', { name: '', proficiency: 'Fluent' })}
                        >
                          <Plus size={16} /> Add Language
                        </button>
                      </div>
                    )}

                    {/* 9. INTERESTS */}
                    {sec.id === 'interests' && (
                      <div className="skills-section-box">
                        <label className="form-label">Add Interests / Hobbies</label>
                        <div className="skill-input-add-row">
                          <input 
                            type="text" 
                            value={newInterestText} 
                            onChange={(e) => setNewInterestText(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterestChip())}
                            placeholder="Type an interest (e.g. Open Source, UI/UX, Bouldering)..." 
                            className="form-input" 
                          />
                          <button type="button" onClick={addInterestChip} className="btn-add-chip">
                            <Plus size={16} /> Add
                          </button>
                        </div>

                        <div className="skill-chips-display">
                          {(resumeData.interests || []).map((interest, idx) => (
                            <span key={idx} className="interactive-skill-chip">
                              {interest}
                              <button type="button" onClick={() => removeInterestChip(idx)} className="chip-remove-btn">
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 10. DECLARATION */}
                    {sec.id === 'declaration' && (
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label className="form-label">Declaration Statement</label>
                          <textarea 
                            rows={3} 
                            value={resumeData.declaration?.text || ''} 
                            onChange={(e) => onChange({
                              ...resumeData,
                              declaration: { ...resumeData.declaration, text: e.target.value }
                            })} 
                            className="form-textarea" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Place</label>
                          <input 
                            type="text" 
                            value={resumeData.declaration?.place || ''} 
                            onChange={(e) => onChange({
                              ...resumeData,
                              declaration: { ...resumeData.declaration, place: e.target.value }
                            })} 
                            placeholder="Bengaluru" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Date</label>
                          <input 
                            type="text" 
                            value={resumeData.declaration?.date || ''} 
                            onChange={(e) => onChange({
                              ...resumeData,
                              declaration: { ...resumeData.declaration, date: e.target.value }
                            })} 
                            placeholder="2026-07-22" 
                            className="form-input" 
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">Digital Signature Name</label>
                          <input 
                            type="text" 
                            value={resumeData.declaration?.signatureName || ''} 
                            onChange={(e) => onChange({
                              ...resumeData,
                              declaration: { ...resumeData.declaration, signatureName: e.target.value }
                            })} 
                            placeholder="Rohith Kumar" 
                            className="form-input" 
                          />
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
