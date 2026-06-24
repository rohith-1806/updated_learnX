import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDepartments, getCategories, getDomains } from "../services/hierarchyApi";
import { getCourses } from "../services/courseApi";
import { getMyEnrollments, enrollInCourse } from "../services/enrollmentApi";
import CourseCard from "../components/CourseCard";
import PageLoader from "../components/common/PageLoader";
import "./Courses.css";

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Navigation states
  // level 0: Departments, 1: Categories, 2: Domains, 3: Courses
  const [level, setLevel] = useState(0);
  const [history, setHistory] = useState([]); // Array of { level, items, title }

  const [items, setItems] = useState([]); // Current level items (depts, cats, domains, courses)
  const [title, setTitle] = useState("Explore Categories");
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);


  useEffect(() => {
    const savedState = sessionStorage.getItem("courses_state");
    if (location.state?.autoOpenItem) {
      loadInitialData();
    } else if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setLevel(parsed.level);
        setHistory(parsed.history);
        setItems(parsed.items);
        setTitle(parsed.title);
        setLoading(false);
        fetchEnrollmentsOnly();
      } catch (err) {
        console.warn("Failed loading saved courses state", err);
        loadInitialData();
      }
    } else {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state to sessionStorage when any core hierarchy changes
  useEffect(() => {
    if (items && items.length > 0) {
      sessionStorage.setItem(
        "courses_state",
        JSON.stringify({ level, history, items, title })
      );
    }
  }, [level, history, items, title]);

  const fetchEnrollmentsOnly = async () => {
    try {
      const enrolls = await getMyEnrollments();
      setEnrollments(enrolls);
    } catch (err) {
      console.error("Failed fetching enrollments only", err);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const depts = await getDepartments();

      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
        try {
          const enrolls = await getMyEnrollments();
          setEnrollments(enrolls);
        } catch (enrollErr) {
          console.warn("Failed fetching enrollments, continuing as guest", enrollErr);
        }
      }

      if (location.state?.autoOpenItem) {
        const targetDept = depts.find(d => d._id === location.state.autoOpenItem._id);
        if (targetDept) {
          const result = await getCategories(targetDept._id);
          setItems(result);
          setLevel(1);
          setTitle(targetDept.name || targetDept.title);
          
          setHistory([{
            level: 0,
            items: depts,
            title: "Explore Categories"
          }]);
          
          // Clear the router state to avoid re-triggering on refresh
          window.history.replaceState({}, document.title);
        } else {
          setItems(depts);
          setLevel(0);
          setTitle("Explore Categories");
        }
      } else {
        setItems(depts);
        setLevel(0);
        setTitle("Explore Categories");
      }
    } catch (err) {
      console.error("Failed to load initial courses hierarchy", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (item) => {
    setLoading(true);

    // Save current state in history before proceeding
    const previousState = {
      level,
      items,
      title,
    };
    const newHistory = [...history, previousState];
    setHistory(newHistory);

    try {
      let result = [];
      let newTitle = item.name || item.title;

      if (level === 0) {
        // Department clicked -> fetch Categories
        result = await getCategories(item._id);
        setItems(result);
        setLevel(1);
        setTitle(newTitle);
      } else if (level === 1) {
        // Category clicked -> fetch Domains
        result = await getDomains(item._id);
        setItems(result);
        setLevel(2);
        setTitle(newTitle);
      } else if (level === 2) {
        // Domain clicked -> fetch Courses
        result = await getCourses(item._id);
        setItems(result);
        setLevel(3);
        setTitle(`${newTitle} Courses`);
      }
    } catch (err) {
      console.error("Error fetching sub-hierarchy", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (history.length === 0) {
      navigate("/");
      return;
    }
    const previousState = history[history.length - 1];
    setItems(previousState.items);
    setLevel(previousState.level);
    setTitle(previousState.title);
    setHistory(history.slice(0, -1));
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      // Immediately refresh enrollments list
      const enrolls = await getMyEnrollments();
      setEnrollments(enrolls);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to enroll. Please login first.");
      throw err;
    }
  };

  // Helper icons and mock summaries for department cards
  const getHierarchyIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("tech")) return "💻";
    if (n.includes("non")) return "🗣️";
    if (n.includes("web")) return "🌐";
    if (n.includes("data")) return "📊";
    if (n.includes("design")) return "🎨";
    if (n.includes("business")) return "📈";
    if (n.includes("cloud")) return "☁️";
    if (n.includes("cyber")) return "🛡️";
    if (n.includes("security")) return "🔒";
    if (n.includes("science")) return "🧪";
    if (n.includes("code") || n.includes("program")) return "⚙️";
    return "📚";
  };

  const getHierarchyDesc = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("technical department")) return "Master coding languages, frameworks, AI databases, and modern cloud deployment protocols.";
    if (n.includes("non technical")) return "Hone key professional traits like team dynamics, business administration, and soft skills.";
    if (n.includes("web dev")) return "Explore responsive styling, client interfaces, server logic, and fullstack frameworks.";
    if (n.includes("data science")) return "Learn statistical modeling, regression models, big data frameworks, and analytics.";
    if (n.includes("artificial")) return "Master neural structures, automation algorithms, natural processing models, and deep learning.";
    return "Unlock structured learning pathways and career advancements in this category.";
  };

  return (
    <div className="courses-page-container">
      <div className="courses-header-section">
        <div className="courses-header-content">
          <div className="navigation-controls">
            <button className="btn-hierarchy-back" onClick={goBack}>
              ← Back
            </button>
          </div>
          <h1 className="courses-section-title section-heading-premium">{title}</h1>
          <p className="courses-section-subtitle">
            {level === 0 && "Select a learning domain path below to browse custom syllabus topics."}
            {level === 1 && "Browse specialized disciplines under this study track."}
            {level === 2 && "Choose a subject area to narrow down learning pathways."}
            {level === 3 && "Choose from our verified expert course tracks to start learning."}
          </p>
        </div>
      </div>

      <div className="courses-main-viewport">
        {loading ? (
          <PageLoader text="Loading Courses..." />
        ) : items.length === 0 ? (
          <div className="viewport-empty-state">
            <div className="empty-icon">📁</div>
            <h3>No Categories Found</h3>
            <p>There are currently no items published at this level of hierarchy.</p>
            {level > 0 && (
              <button className="btn-lms-retry" onClick={goBack}>
                Go Back
              </button>
            )}
          </div>
        ) : level === 3 ? (
          // Level 3 renders Course Cards
          <div className="courses-catalog-grid">
            {items.map((course) => {
              const enrollment = enrollments.find((e) => e.courseId?._id === course._id || e.courseId === course._id);
              return (
                <CourseCard
                  key={course._id}
                  course={course}
                  enrollment={enrollment}
                  onEnroll={handleEnroll}
                />
              );
            })}
          </div>
        ) : (
          // Levels 0-3 render hierarchy cards (Udemy-like cards layout)
          <div className="hierarchy-cards-grid">
            {items.map((item) => (
              <div key={item._id} className="hierarchy-item-card" onClick={() => handleCardClick(item)}>
                <div className="card-top-accent"></div>
                <div className="hierarchy-card-icon">{getHierarchyIcon(item.name)}</div>
                <h3 className="hierarchy-card-title">{item.name}</h3>
                <p className="hierarchy-card-desc">{getHierarchyDesc(item.name)}</p>
                <div className="hierarchy-card-action">
                  <span>Explore Path</span>
                  <span className="arrow-indic">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
