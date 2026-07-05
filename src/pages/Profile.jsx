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

  // Tab State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("profileActiveTab") || "courses");

  useEffect(() => {
    localStorage.setItem("profileActiveTab", activeTab);
  }, [activeTab]);

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
            <div className="profile-detail-row">
              <strong>Name:</strong> <span>{user?.name || "Student"}</span>
            </div>
            <div className="profile-detail-row">
              <strong>Email:</strong> <span>{user?.email}</span>
            </div>
            <div className="profile-detail-row">
              <strong>Role:</strong> <span className="role-badge">{user?.role || "Student"}</span>
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
                <button className="btn-primary" onClick={() => navigate("/courses")}>Browse Catalogue</button>
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
                      <h4>{courseName}</h4>
                      <p className="instructor-meta">{courseDetail.instructor || "LernX Team"}</p>
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
                <button className="btn-primary" onClick={() => navigate("/events")}>Browse Events</button>
              </div>
            ) : (
              <div className="tab-grid">
                {events.map((regEvt) => {
                  const evtDetail = regEvt.eventId || regEvt;
                  if (!evtDetail || (!evtDetail.name && !evtDetail.title)) return null;
                  return (
                    <div className="event-card glass-card" key={regEvt._id}>
                      <h4>{evtDetail.title || evtDetail.name}</h4>
                      <div className="event-meta">
                        <span style={{display:"flex", alignItems:"center", gap:4}}><CalendarDays size={14} /> {evtDetail.date ? new Date(evtDetail.date).toLocaleDateString() : "TBA"}</span>
                        <span style={{display:"flex", alignItems:"center", gap:4}}><MapPin size={14} /> {evtDetail.location || "Online"}</span>
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
                <button type="submit" className="btn-primary" disabled={submittingPassword}>
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
      <aside className="profile-sidebar glass-panel">
        <div className="sidebar-user-info">
          <div className="avatar">
            {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
          </div>
          <h3>{user?.name || "Student"}</h3>
          <p>{user?.email}</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}><User size={18} /> Profile</button>
          <button className={`nav-item ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}><BookOpen size={18} /> Enrolled Courses</button>
          <button className={`nav-item ${activeTab === "certificates" ? "active" : ""}`} onClick={() => setActiveTab("certificates")}><Award size={18} /> Certificates</button>
          <button className={`nav-item ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}><CalendarDays size={18} /> Registered Events</button>
          <button className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}><Settings size={18} /> Settings</button>
        </nav>
      </aside>
      <main className="profile-content-area">
        {renderContent()}
      </main>
    </div>
  );
};

export default Profile;
