import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../context/ProgressContext";
import { useTheme } from "../context/ThemeContext";
import { getMyEvents } from "../services/authApi";
import { getMyCertificates } from "../services/certificateApi";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { CourseCardSkeleton, CertificateCardSkeleton, EventCardSkeleton, SettingsSkeleton } from "../components/common/ProfileSkeletons";
import { User, BookOpen, Award, CalendarDays, Settings, LogOut, CheckCircle, ChevronRight, Sun, Moon, MapPin } from "lucide-react";
import "./Profile.css";

// --------------------------------------------------------------------------
// ANIMATED COUNTER COMPONENT
// --------------------------------------------------------------------------
const AnimatedCounter = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const end = parseInt(value, 10);
    if (isNaN(end) || end <= 0) {
      setCount(0);
      return;
    }

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return <span>{count}</span>;
};

// Helper function to screen out tutorial files/sandbox exercises
const isActualCourse = (name) => {
  if (!name) return false;
  const lower = name.toLowerCase();
  if (lower.includes("tutorial") || lower.includes("video") || lower.includes("task") ||
      lower.includes("quiz") || lower.includes("module") || lower.includes("assignment") ||
      lower === "html elements") return false;
  return true;
};

const Profile = () => {
  const { user, updatePassword, certificates, setCertificates } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  
  const { progressData, fetchAllUserProgress } = useProgress();
  const [profileLoading, setProfileLoading] = useState(true);

  // Tab State - default to "courses" as in original
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("profileActiveTab") || "courses");

  useEffect(() => {
    localStorage.setItem("profileActiveTab", activeTab);
  }, [activeTab]);

  // Processes unique enrollments from user course progress data
  const processedEnrollments = useMemo(() => {
    if (!progressData) return [];
    const uniqueMap = new Map();
    Object.values(progressData).forEach(data => {
      const enroll = data.originalEnrollment;
      if (!enroll) return;
      const courseDetail = enroll.courseId;
      if (!courseDetail) return;
      const rawName = enroll.course?.title || enroll.course?.name || courseDetail.name || courseDetail.title || (typeof courseDetail === "string" ? courseDetail : "");
      if (!isActualCourse(rawName)) return;
      const currentProgress = enroll.progressPercentage !== undefined ? enroll.progressPercentage : (enroll.progress || 0);
      const existing = uniqueMap.get(rawName);
      if (!existing) {
        uniqueMap.set(rawName, enroll);
      } else {
        const existingProgress = existing.progressPercentage !== undefined ? existing.progressPercentage : (existing.progress || 0);
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const currentTime = new Date(enroll.updatedAt || enroll.createdAt || 0).getTime();
        if (currentProgress > existingProgress || (currentProgress === existingProgress && currentTime > existingTime)) {
          uniqueMap.set(rawName, enroll);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [progressData]);

  // Computes completed courses dynamically (progress percentage == 100%)
  const completedEnrollments = useMemo(() => {
    return processedEnrollments.filter(enroll => {
      const progressVal = enroll.progress !== undefined ? enroll.progress : (enroll.progressPercentage || 0);
      return progressVal === 100;
    });
  }, [processedEnrollments]);

  const completedCoursesCount = completedEnrollments.length;

  const joinedDateStr = useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      return new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return null;
    }
  }, [user?.createdAt]);

  const fetchProfileData = useCallback(async () => {
    setProfileLoading(true);
    try {
      if (user) await fetchAllUserProgress();
      const myEvents = await getMyEvents();
      setEvents(Array.isArray(myEvents) ? myEvents : []);
      const certs = await getMyCertificates();
      const validCerts = (Array.isArray(certs) ? certs : []).filter(c => c.courseId && typeof c.courseId === 'object' && (c.courseId.name || c.courseId.title));
      setCertificates(validCerts);
    } catch (err) {
      console.error("Failed to load profile lists", err);
    } finally {
      setProfileLoading(false);
    }
  }, [user, fetchAllUserProgress, setCertificates]);

  useEffect(() => {
    if (!localStorage.getItem("token") && !localStorage.getItem("userToken")) {
      navigate("/user-login"); return;
    }
    fetchProfileData();
  }, [location.key, fetchProfileData, navigate]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    if (activeTab === 'certificates' && location.state?.highlightCert && certificates.length > 0) {
      const el = document.getElementById(`cert-${location.state.highlightCert}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-animation');
        setTimeout(() => el.classList.remove('highlight-animation'), 3000);
      }
    }
  }, [activeTab, location.state?.highlightCert, certificates]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) { alert("Password cannot be empty."); return; }
    if (newPassword !== confirmPassword) { alert("Passwords do not match."); return; }
    setSubmittingPassword(true);
    try {
      await updatePassword(newPassword);
      alert("Password updated successfully!");
      setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      alert(err.message || "Failed to update password.");
    } finally { setSubmittingPassword(false); }
  };

  const renderContent = () => {
    if (profileLoading) {
      if (activeTab === "courses") return <div className="tab-grid"><CourseCardSkeleton /><CourseCardSkeleton /></div>;
      if (activeTab === "completed") return <div className="tab-grid"><CourseCardSkeleton /><CourseCardSkeleton /></div>;
      if (activeTab === "certificates") return <div className="tab-grid"><CertificateCardSkeleton /><CertificateCardSkeleton /></div>;
      if (activeTab === "events") return <div className="tab-grid"><EventCardSkeleton /><EventCardSkeleton /></div>;
      if (activeTab === "settings") return <SettingsSkeleton />;
      if (activeTab === "profile") return <SettingsSkeleton />;
    }

    switch (activeTab) {
      case "profile":
        return (
          <div className="tab-content glass-card">
            <h2>User Profile</h2>
            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <span className="profile-detail-label">Name</span>
                <span className="profile-detail-value">{user?.name || "Student"}</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Email Address</span>
                <span className="profile-detail-value">{user?.email}</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Current Role</span>
                <span className="profile-detail-value">
                  <span className="role-badge">{user?.role || "Student"}</span>
                </span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Joined Date</span>
                <span className="profile-detail-value">{joinedDateStr || "Recently"}</span>
              </div>
            </div>
          </div>
        );
      case "courses":
        return (
          <div className="tab-content">
            <h2>Enrolled Learning Pathways ({processedEnrollments.length})</h2>
            {processedEnrollments.length === 0 ? (
              <div className="empty-profile-section glass-card">
                <p>You haven't enrolled in any courses yet.</p>
                <button className="btn-primary" onClick={() => navigate("/courses")} style={{maxWidth: 240}}>Browse Catalogue</button>
              </div>
            ) : (
              <div className="tab-grid">
                {processedEnrollments.map((enroll) => {
                  const courseDetail = enroll.courseId;
                  if (!courseDetail) return null;
                  const courseId = courseDetail._id || courseDetail;
                  const progressVal = enroll.progress !== undefined ? enroll.progress : (enroll.progressPercentage || 0);
                  const courseName = enroll.course?.title || enroll.course?.name || courseDetail.name || courseDetail.title || "";
                  return (
                    <div className="course-card glass-card" key={enroll._id}>
                      <div>
                        <h4>{courseName}</h4>
                        <p className="instructor-meta">{courseDetail.instructor || "LernX Team"}</p>
                      </div>
                      <div className="progress-wrapper">
                        <div className="progress-label">
                          {progressVal === 100 ? <><CheckCircle size={14} style={{marginRight: 4}} /> Completed</> : `${progressVal}%`}
                        </div>
                        <ProgressBar progress={progressVal} />
                      </div>
                      <button className="btn-primary" onClick={() => navigate(progressVal > 0 ? `/player/${courseId}` : `/course/${courseId}`)}>
                        {progressVal === 100 ? "Course Completed " : "Continue "} <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "completed":
        return (
          <div className="tab-content">
            <h2>Completed Courses ({completedCoursesCount})</h2>
            {completedEnrollments.length === 0 ? (
              <div className="empty-profile-section glass-card">
                <p>You haven't completed any courses yet.</p>
                <button className="btn-primary" onClick={() => navigate("/courses")} style={{maxWidth: 240}}>Start Learning</button>
              </div>
            ) : (
              <div className="tab-grid">
                {completedEnrollments.map((enroll) => {
                  const courseDetail = enroll.courseId;
                  if (!courseDetail) return null;
                  const courseId = courseDetail._id || courseDetail;
                  const progressVal = 100;
                  const courseName = enroll.course?.title || enroll.course?.name || courseDetail.name || courseDetail.title || "";
                  return (
                    <div className="course-card glass-card" key={enroll._id}>
                      <div>
                        <h4>{courseName}</h4>
                        <p className="instructor-meta">{courseDetail.instructor || "LernX Team"}</p>
                      </div>
                      <div className="progress-wrapper">
                        <div className="progress-label">
                          <CheckCircle size={14} style={{marginRight: 4}} /> Completed
                        </div>
                        <ProgressBar progress={progressVal} />
                      </div>
                      <button className="btn-primary" onClick={() => navigate(`/player/${courseId}`)}>
                        Review Course <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "certificates":
        return (
          <div className="tab-content">
            <h2>My Certificates ({certificates.length})</h2>
            {certificates.length === 0 ? (
              <div className="empty-profile-section glass-card">
                <p>Complete a course to earn your first certificate.</p>
              </div>
            ) : (
              <div className="tab-grid">
                {certificates.map((cert) => {
                  const courseDetail = cert.courseId;
                  if (!courseDetail) return null;
                  return (
                    <div id={`cert-${cert._id}`} className="certificate-badge-card glass-card" key={cert._id}>
                      <div className="cert-icon"><Award size={32} color="#8b5cf6" /></div>
                      <h4>{courseDetail.name || courseDetail.title}</h4>
                      <p>Issued: {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : "Recently"}</p>
                      <button className="btn-primary" onClick={() => navigate(`/certificate/preview`, { state: { cert, course: { ...courseDetail, name: courseDetail.name || courseDetail.title } } })}>
                        View Certificate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "events":
        return (
          <div className="tab-content">
            <h2>Registered Events ({events.length})</h2>
            {events.length === 0 ? (
              <div className="empty-profile-section glass-card">
                <p>You haven't registered for any events yet.</p>
                <button className="btn-primary" onClick={() => navigate("/events")} style={{maxWidth: 240}}>Browse Events</button>
              </div>
            ) : (
              <div className="tab-grid">
                {events.map((regEvt) => {
                  const evtDetail = regEvt.eventId || regEvt;
                  if (!evtDetail || (!evtDetail.name && !evtDetail.title)) return null;
                  return (
                    <div className="event-card glass-card" key={regEvt._id}>
                      <div>
                        <h4>{evtDetail.title || evtDetail.name}</h4>
                        <div className="event-meta">
                          <span style={{display:"flex", alignItems:"center", gap:6}}><CalendarDays size={14} /> {evtDetail.date ? new Date(evtDetail.date).toLocaleDateString() : "TBA"}</span>
                          <span style={{display:"flex", alignItems:"center", gap:6}}><MapPin size={14} /> {evtDetail.location || "Online"}</span>
                        </div>
                      </div>
                      <span className={`category-pill ${evtDetail.category?.toLowerCase() === "it" ? "it" : "non-it"}`}>
                        {evtDetail.category || "General"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="tab-content glass-card">
            <h2>Settings</h2>
            <div className="settings-section">
              <h3>Theme</h3>
              <button onClick={toggleTheme} className="btn-secondary" style={{display:"flex", alignItems:"center", gap:8}}>
                {theme === 'dark' ? <><Sun size={16} /> Switch to Light Mode</> : <><Moon size={16} /> Switch to Dark Mode</>}
              </button>
            </div>
            <div className="settings-section">
              <h3>Update Password</h3>
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={submittingPassword} style={{maxWidth: 200}}>
                  {submittingPassword ? "Saving..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-dashboard-layout">
      {/* PROFILE SIDEBAR */}
      <aside className="profile-sidebar">
        <div className="sidebar-user-card">
          <div className="avatar-wrapper">
            <div className="avatar-glow"></div>
            <div className="premium-avatar">
              {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
          </div>
          <div className="user-info-details">
            <h3 className="user-name">{user?.name || "Student"}</h3>
            <p className="user-email">{user?.email}</p>
            <span className="user-meta-badge">{user?.role || "Student"}</span>
            {joinedDateStr && <span className="user-join-date">Joined {joinedDateStr}</span>}
          </div>
        </div>

        <nav className="sidebar-nav-list">
          <button 
            className={`nav-item-btn ${activeTab === "profile" ? "active" : ""}`} 
            onClick={() => setActiveTab("profile")}
          >
            <span className="nav-item-content">
              <User size={18} />
              Profile
            </span>
          </button>
          
          <button 
            className={`nav-item-btn ${activeTab === "courses" ? "active" : ""}`} 
            onClick={() => setActiveTab("courses")}
          >
            <span className="nav-item-content">
              <BookOpen size={18} />
              Enrolled Courses
            </span>
            <span className="nav-count-badge">
              {profileLoading ? "..." : processedEnrollments.length}
            </span>
          </button>

          <button 
            className={`nav-item-btn ${activeTab === "completed" ? "active" : ""}`} 
            onClick={() => setActiveTab("completed")}
          >
            <span className="nav-item-content">
              <CheckCircle size={18} />
              Completed Courses
            </span>
            <span className="nav-count-badge">
              {profileLoading ? "..." : completedCoursesCount}
            </span>
          </button>

          <button 
            className={`nav-item-btn ${activeTab === "certificates" ? "active" : ""}`} 
            onClick={() => setActiveTab("certificates")}
          >
            <span className="nav-item-content">
              <Award size={18} />
              Certificates
            </span>
            <span className="nav-count-badge">
              {profileLoading ? "..." : certificates.length}
            </span>
          </button>

          <button 
            className={`nav-item-btn ${activeTab === "events" ? "active" : ""}`} 
            onClick={() => setActiveTab("events")}
          >
            <span className="nav-item-content">
              <CalendarDays size={18} />
              Registered Events
            </span>
            <span className="nav-count-badge">
              {profileLoading ? "..." : events.length}
            </span>
          </button>

          <button 
            className={`nav-item-btn ${activeTab === "settings" ? "active" : ""}`} 
            onClick={() => setActiveTab("settings")}
          >
            <span className="nav-item-content">
              <Settings size={18} />
              Settings
            </span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="profile-content-area">
        {/* PREMIUM HERO HEADER */}
        {activeTab === "profile" && (
          profileLoading ? (
            <section className="premium-hero-header skeleton">
              <div className="skeleton-hero-line welcome"></div>
              <div className="skeleton-hero-line name"></div>
              <div className="skeleton-hero-line title"></div>
              <div className="skeleton-hero-line desc"></div>
            </section>
          ) : (
            <section className="premium-hero-header">
              <div className="hero-glow-effect"></div>
              <p className="hero-welcome-lbl">Welcome back,</p>
              <h1 className="hero-user-name">{user?.name || "Student"}</h1>
              <h2 className="hero-dashboard-title">Learning Dashboard</h2>
              <p className="hero-subdescription">
                Track your enrolled courses, learning progress, certificates and registered events.
              </p>
            </section>
          )
        )}

        {/* STATISTICS CARDS GRID */}
        {activeTab === "profile" && (
          <section className="stats-cards-grid">
            {/* Card 1: Enrolled */}
            <div className="stat-glass-card" onClick={() => setActiveTab("courses")}>
              <div className="stat-card-gradient-glow"></div>
              <div className="stat-card-header">
                <span className="stat-card-title">Enrolled Courses</span>
                <div className="stat-card-icon-container">
                  <BookOpen size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {profileLoading ? "..." : <AnimatedCounter value={processedEnrollments.length} />}
              </div>
              <p className="stat-card-desc">Active learning pathways</p>
            </div>

            {/* Card 2: Completed */}
            <div className="stat-glass-card" onClick={() => setActiveTab("completed")}>
              <div className="stat-card-gradient-glow"></div>
              <div className="stat-card-header">
                <span className="stat-card-title">Completed Courses</span>
                <div className="stat-card-icon-container">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {profileLoading ? "..." : <AnimatedCounter value={completedCoursesCount} />}
              </div>
              <p className="stat-card-desc">Completed curriculum tracks</p>
            </div>

            {/* Card 3: Certificates */}
            <div className="stat-glass-card" onClick={() => setActiveTab("certificates")}>
              <div className="stat-card-gradient-glow"></div>
              <div className="stat-card-header">
                <span className="stat-card-title">Certificates</span>
                <div className="stat-card-icon-container">
                  <Award size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {profileLoading ? "..." : <AnimatedCounter value={certificates.length} />}
              </div>
              <p className="stat-card-desc">Earned course credentials</p>
            </div>

            {/* Card 4: Events */}
            <div className="stat-glass-card" onClick={() => setActiveTab("events")}>
              <div className="stat-card-gradient-glow"></div>
              <div className="stat-card-header">
                <span className="stat-card-title">Registered Events</span>
                <div className="stat-card-icon-container">
                  <CalendarDays size={20} />
                </div>
              </div>
              <div className="stat-card-value">
                {profileLoading ? "..." : <AnimatedCounter value={events.length} />}
              </div>
              <p className="stat-card-desc">Upcoming webinars & bootcamps</p>
            </div>
          </section>
        )}

        {/* TAB VIEWPORT */}
        <div className="profile-tab-viewport">
          <div className="tab-fade-container" key={activeTab}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
