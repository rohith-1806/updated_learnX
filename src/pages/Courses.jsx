import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDepartments, getCategories, getDomains } from "../services/hierarchyApi";
import { getCourses } from "../services/courseApi";
import { getMyEnrollments, enrollInCourse } from "../services/enrollmentApi";
import CourseCard from "../components/CourseCard";
import PageLoader from "../components/common/PageLoader";
import { Laptop, MessageSquare, Globe, BarChart, Palette, TrendingUp, Cloud, ShieldCheck, Lock, FlaskConical, Settings, BookOpen, FolderOpen, ArrowRight } from "lucide-react";
import "./Courses.css";

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [level, setLevel] = useState(0);
  const [history, setHistory] = useState([]);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("Explore Categories");
  const [loading, setLoading] = useState(true);
  const [intentLoaded, setIntentLoaded] = useState(false);
  const [enrollments, setEnrollments] = useState([]);

  const skeletonCount = useMemo(() => {
    if (level === 3) return Math.min(items.length || 0, 12) || 8;
    return 8;
  }, [level, items]);

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
        setIntentLoaded(true);
        fetchEnrollmentsOnly();
      } catch (err) {
        console.warn("Failed loading saved courses state", err);
        loadInitialData();
      }
    } else {
      loadInitialData();
    }
  }, []);

  useEffect(() => {
    if (items && items.length > 0 && intentLoaded) {
      sessionStorage.setItem("courses_state", JSON.stringify({ level, history, items, title }));
    }
  }, [level, history, items, title, intentLoaded]);

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
    setIntentLoaded(false);
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
          setHistory([{ level: 0, items: depts, title: "Explore Categories" }]);
          window.history.replaceState({}, document.title);
        } else {
          setItems(depts); setLevel(0); setTitle("Explore Categories");
        }
      } else {
        setItems(depts); setLevel(0); setTitle("Explore Categories");
      }
    } catch (err) {
      console.error("Failed to load initial courses hierarchy", err);
      setItems([]);
    } finally {
      setLoading(false);
      setIntentLoaded(true);
    }
  };

  const handleCardClick = async (item) => {
    setLoading(true);
    const previousState = { level, items, title };
    const newHistory = [...history, previousState];
    setHistory(newHistory);
    try {
      let result = [];
      let newTitle = item.name || item.title;
      if (level === 0) {
        result = await getCategories(item._id);
        setItems(result); setLevel(1); setTitle(newTitle);
      } else if (level === 1) {
        result = await getDomains(item._id);
        setItems(result); setLevel(2); setTitle(newTitle);
      } else if (level === 2) {
        result = await getCourses(item._id);
        setItems(result); setLevel(3); setTitle(`${newTitle} Courses`);
      }
    } catch (err) {
      console.error("Error fetching sub-hierarchy", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (history.length === 0) { navigate("/"); return; }
    const previousState = history[history.length - 1];
    setItems(previousState.items);
    setLevel(previousState.level);
    setTitle(previousState.title);
    setHistory(history.slice(0, -1));
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      const enrolls = await getMyEnrollments();
      setEnrollments(enrolls);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to enroll. Please login first.");
      throw err;
    }
  };

  const getHierarchyIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("tech")) return <Laptop size={24} />;
    if (n.includes("non")) return <MessageSquare size={24} />;
    if (n.includes("web")) return <Globe size={24} />;
    if (n.includes("data")) return <BarChart size={24} />;
    if (n.includes("design")) return <Palette size={24} />;
    if (n.includes("business")) return <TrendingUp size={24} />;
    if (n.includes("cloud")) return <Cloud size={24} />;
    if (n.includes("cyber")) return <ShieldCheck size={24} />;
    if (n.includes("security")) return <Lock size={24} />;
    if (n.includes("science")) return <FlaskConical size={24} />;
    if (n.includes("code") || n.includes("program")) return <Settings size={24} />;
    return <BookOpen size={24} />;
  };

  return (
    <div className="courses-page-container">
      <div className="courses-header-section">
        <div className="courses-header-content">
          <div className="navigation-controls">
            <button className="btn-hierarchy-back" onClick={goBack}>← Back</button>
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
          <PageLoader />
        ) : items.length === 0 ? (
          <div className="viewport-empty-state">
            <div className="empty-icon"><FolderOpen size={48} color="#94a3b8" /></div>
            <h3>No Categories Found</h3>
            <p>There are currently no items published at this level of hierarchy.</p>
            {level > 0 && <button className="btn-lms-retry" onClick={goBack}>Go Back</button>}
          </div>
        ) : level === 3 ? (
          <div className="courses-catalog-grid">
            {items.map((course) => {
              const enrollment = enrollments.find((e) => e.courseId?._id === course._id || e.courseId === course._id);
              return <CourseCard key={course._id} course={course} enrollment={enrollment} onEnroll={handleEnroll} />;
            })}
          </div>
        ) : (
          <div className="hierarchy-cards-grid">
            {items.map((item) => (
              <div key={item._id} className="hierarchy-item-card" onClick={() => handleCardClick(item)}>
                <div className="card-top-accent"></div>
                <div className="hierarchy-card-icon">{getHierarchyIcon(item.name)}</div>
                <h3 className="hierarchy-card-title">{item.name}</h3>
                <div className="hierarchy-card-action">
                  <span>Explore Path</span>
                  <span className="arrow-indic"><ArrowRight size={16} /></span>
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
