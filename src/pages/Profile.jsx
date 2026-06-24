import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getMyEnrollments } from "../services/enrollmentApi";
import { getMyEvents } from "../services/authApi";
import { getMyCertificates } from "../services/certificateApi";
import { getModules } from "../services/courseApi";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageLoader from "../components/common/PageLoader";
import "./Profile.css";

const cleanCourseName = (name, description) => {
  const invalidNames = ["Tutorials", "Videos", "Assignments", "Quizzes", "Projects", "Modules"];
  if (invalidNames.includes(name)) return null;

  if (name === "HTML Complete Tutorial") return "HTML Complete Course";
  
  if (description) {
    const parts = description.split(/\s+content\s+for\s+/i);
    if (parts.length > 1) {
      let trackName = parts[1].trim();
      if (trackName.toLowerCase().includes("communication")) return "Communication";
      if (trackName.toLowerCase().includes("soft skills")) return "Soft Skills";
      if (trackName.toLowerCase().includes("data science")) return "Data Science";
      if (trackName.toLowerCase().includes("aptitude")) return "Aptitude Training";
      if (trackName.toLowerCase().includes("express")) return "Express.js";
      if (trackName.toLowerCase().includes("mongodb")) return "MongoDB";
      if (trackName.toLowerCase().includes("personality")) return "Personality Development";
      if (trackName.toLowerCase().includes("interview")) return "Interview Preparation";
      if (trackName.toLowerCase().includes("cyber")) return "Cyber Security";
      if (trackName.toLowerCase().includes("cloud")) return "Cloud Computing";
      if (trackName.toLowerCase().includes("ai track")) return "AI Track";
      return trackName;
    }
  }
  return name || "";
};

const Profile = () => {
  const { user, updatePassword, certificates, setCertificates } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [enrollments, setEnrollments] = useState([]);
  const [events, setEvents] = useState([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [showPasswordChange, setShowPasswordChange] = useState(() => {
    return user?.firstLogin === true;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setShowPasswordChange(user.firstLogin === true);
    }
  }, [user]);

  // Wrap fetchProfileData in useCallback so we can use it safely in effects
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const activeEnrollments = await getMyEnrollments();
      
      const uniqueEnrollmentsMap = new Map();
      activeEnrollments.forEach(enroll => {
        const courseDetail = enroll.courseId;
        if (!courseDetail) return;
        
        const rawName = enroll.course?.title || enroll.course?.name || courseDetail.name || courseDetail.title || (typeof courseDetail === "string" ? courseDetail : "");
        const invalidNames = ["Tutorials", "Videos", "Assignments", "Quizzes", "Projects", "Modules"];

        // Always keep completed courses — never filter them out even if raw name matches an invalid label
        const currentProgress = enroll.progress !== undefined ? enroll.progress : (enroll.progressPercentage || 0);
        const isCompleted100 = currentProgress === 100;

        // Skip sub-modules/invalid names only when course is NOT yet completed
        if (!isCompleted100 && invalidNames.includes(rawName)) return;

        const cName = cleanCourseName(rawName, courseDetail.description);
        if (!cName) return;

        const existing = uniqueEnrollmentsMap.get(cName);
        if (!existing) {
          uniqueEnrollmentsMap.set(cName, enroll);
        } else {
          const existingProgress = existing.progress !== undefined ? existing.progress : (existing.progressPercentage || 0);
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const currentTime = new Date(enroll.updatedAt || enroll.createdAt || 0).getTime();
          
          // Always prefer the higher progress; on tie, prefer more recent
          if (currentProgress > existingProgress || (currentProgress === existingProgress && currentTime > existingTime)) {
            uniqueEnrollmentsMap.set(cName, enroll);
          }
        }
      });
      const deduplicatedEnrollments = Array.from(uniqueEnrollmentsMap.values());

      const enrichedEnrollments = await Promise.all(
        deduplicatedEnrollments.map(async (enroll) => {
          const courseDetail = enroll.courseId;
          if (!courseDetail) return enroll;
          const courseId = courseDetail._id || courseDetail;
          try {
            const modules = await getModules(courseId);
            return {
              ...enroll,
              hasModules: modules && modules.length > 0,
            };
          } catch (e) {
            console.error(`Failed to fetch modules for course ${courseId}`, e);
            return {
              ...enroll,
              hasModules: false,
            };
          }
        })
      );
      setEnrollments(enrichedEnrollments);

      const myEvents = await getMyEvents();
      setEvents(Array.isArray(myEvents) ? myEvents : []);

      const certs = await getMyCertificates();
      setCertificates(Array.isArray(certs) ? certs : []);
    } catch (err) {
      console.error("Failed to load profile lists", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch whenever user navigates TO profile page (e.g. back from CoursePlayer)
  useEffect(() => {
    if (!localStorage.getItem("token") && !localStorage.getItem("userToken")) {
      navigate("/user-login");
      return;
    }
    fetchProfileData();
  }, [location.key, fetchProfileData, navigate]);

  // Also re-fetch on browser tab regain focus so progress is always fresh
  useEffect(() => {
    const handleFocus = () => {
      if (localStorage.getItem("token") || localStorage.getItem("userToken")) {
        fetchProfileData();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchProfileData]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert("Password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setSubmittingPassword(true);
    try {
      await updatePassword(newPassword);
      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      if (user) {
        user.firstLogin = false;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
      }
      setShowPasswordChange(false);
    } catch (err) {
      alert(err.message || "Failed to update password.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-grid-layout">
        {/* Left Column: User Card & Credentials */}
        <aside className="profile-sidebar-col">
          <div className="user-details-card rounded-card shadow-card">
            <div className="avatar-placeholder">
              {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
            </div>
            <h2>{user?.name || "Student"}</h2>
            <p className="user-email">{user?.email}</p>
            <span className="user-role-badge">{user?.role || "Student"}</span>
            <div style={{ marginTop: "1.5rem", width: "100%" }}>
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>

          {showPasswordChange && (
            <div className="credentials-card rounded-card shadow-card">
              <h3>Update Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group-item">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-item">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Re-type New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-update-pwd"
                  disabled={submittingPassword}
                >
                  {submittingPassword ? "Saving..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </aside>

        {/* Right Column: Dynamic LMS logs */}
        <main className="profile-main-col">
          {/* Section 1: Active Enrollments */}
          <div className="profile-section-card rounded-card shadow-card">
            <h3 className="section-heading-premium">Enrolled Learning Pathways ({enrollments.length})</h3>
            {enrollments.length === 0 ? (
              <div className="empty-profile-section">
                <p>You haven't enrolled in any courses yet.</p>
                <button className="btn-browse-courses" onClick={() => navigate("/courses")}>
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="profile-enrollments-list">
                {enrollments.map((enroll) => {
                  const courseDetail = enroll.courseId;
                  if (!courseDetail) return null;
                  const courseId = courseDetail._id || courseDetail;
                  // Backend progress is the single source of truth
                  const progressVal = enroll.progress !== undefined
                    ? enroll.progress
                    : (enroll.progressPercentage || 0);

                  return (
                    <div className="profile-enrollment-row" key={enroll._id}>
                      <div className="row-info-col">
                        <h4>{enroll.course?.title || enroll.course?.name}</h4>
                        <span className="row-meta">Instructor: {courseDetail.instructor || "LernX Team"}</span>
                      </div>

                      <div className="row-progress-col">
                        <div className="progress-value-label">
                          {progressVal === 100 ? "✅ Completed" : `${progressVal}% Complete`}
                        </div>
                        <ProgressBar progress={progressVal} />
                      </div>

                      <div className="row-actions-col">
                        <button
                          className="btn-row-action"
                          onClick={() => navigate(enroll.hasModules ? `/player/${courseId}` : `/course/${courseId}`)}
                        >
                          {progressVal === 100 ? "View Course →" : "Continue Learning →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Earned Certificates */}
          <div className="profile-section-card rounded-card shadow-card">
            <h3>My Digital Credentials ({certificates.length})</h3>
            {certificates.length === 0 ? (
              <div className="empty-profile-section">
                <p>Earned certificates will appear here once you reach 100% progress.</p>
              </div>
            ) : (
              <div className="certificates-grid-display">
                {certificates.map((cert) => {
                  const courseDetail = cert.courseId;
                  if (!courseDetail) return null;
                  return (
                    <div className="certificate-badge-card" key={cert._id}>
                      <svg className="cert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"></circle>
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                      </svg>
                      <h4>{cleanCourseName(courseDetail.name, courseDetail.description)}</h4>
                      <p className="cert-meta-txt">Issued: {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : "Recently"}</p>
                      <button
                        className="btn-view-certificate"
                        onClick={() => navigate(`/certificate/preview`, { state: { cert, course: { ...courseDetail, name: cleanCourseName(courseDetail.name, courseDetail.description) } } })}
                      >
                        Download Certificate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Registered Webinars */}
          <div className="profile-section-card rounded-card shadow-card">
            <h3>Registered Workshops ({events.length})</h3>
            {events.length === 0 ? (
              <div className="empty-profile-section">
                <p>You haven't registered for any events yet.</p>
                <button className="btn-browse-courses" onClick={() => navigate("/events")}>
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="profile-events-list">
                {events.map((regEvt) => {
                  const evtDetail = regEvt.eventId || regEvt;
                  if (!evtDetail || (!evtDetail.name && !evtDetail.title)) return null;

                  return (
                    <div className="profile-event-row" key={regEvt._id}>
                      <div className="evt-row-main">
                        <h4>{evtDetail.title || evtDetail.name}</h4>
                        <div className="evt-row-meta">
                          <span className="evt-meta-item">
                            <svg className="evt-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                              <line x1="16" x2="16" y1="2" y2="6"></line>
                              <line x1="8" x2="8" y1="2" y2="6"></line>
                              <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            {evtDetail.date ? new Date(evtDetail.date).toLocaleDateString() : "TBA"}
                          </span>
                          <span className="evt-meta-item">
                            <svg className="evt-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {evtDetail.location || "Online"}
                          </span>
                        </div>
                      </div>
                      <span className={`evt-category-pill ${evtDetail.category?.toLowerCase() === "it" ? "it" : "non-it"}`}>
                        {evtDetail.category || "General"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
