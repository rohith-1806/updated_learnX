import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { useProgress } from "../context/ProgressContext";
import "./CourseCard.css";

const CourseCard = ({ course, enrollment, onEnroll }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { progressData } = useProgress();

  // Prefer global context progress if available
  const courseProgress = progressData[course._id];
  
  const isEnrolled = !!courseProgress || !!enrollment;
  const progress = courseProgress ? courseProgress.percentage : (enrollment ? (enrollment.progressPercentage !== undefined ? enrollment.progressPercentage : enrollment.progress || 0) : 0);

  const handleButtonClick = async (e) => {
    e.stopPropagation(); // Avoid navigating to details page
    if (isEnrolled) {
      // Resume from last position if saved in localStorage
      const lastLessonId = localStorage.getItem(`last_lesson_${course._id}`);
      if (lastLessonId) {
        navigate(`/player/${course._id}?lessonId=${lastLessonId}`);
      } else {
        navigate(`/player/${course._id}`);
      }
    } else {
      setLoading(true);
      try {
        await onEnroll(course._id);
      } catch (err) {
        console.error("Failed to enroll", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getDifficultyColor = (difficulty = "Intermediate") => {
    const d = difficulty.toLowerCase();
    if (d.includes("begin")) return "difficulty-beginner";
    if (d.includes("adv")) return "difficulty-advanced";
    return "difficulty-intermediate";
  };

  const getGradient = (id) => {
    // Generate a beautiful distinct gradient based on course ID
    const colors = [
      "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    ];
    const index = id ? id.charCodeAt(id.length - 1) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="course-card" onClick={() => navigate(`/course/${course._id}`)}>
      <div className="course-card-banner" style={{ background: getGradient(course._id) }}>
        <span className={`difficulty-badge ${getDifficultyColor(course.difficulty)}`}>
          {course.difficulty || "Intermediate"}
        </span>
        <div className="banner-overlay">
          <span className="course-category-badge">
            {typeof course.category === 'object' ? course.category?.name : course.category || "Course"}
          </span>
          <span className="course-status">{course.status || "Active"}</span>
        </div>
      </div>

      <div className="course-card-body">
        <h4 className="course-card-title">{course.name}</h4>
        <p className="course-card-description">
          {course.description || "Learn industry standard skills with this comprehensive course."}
        </p>

        <div className="course-card-meta">
          <div className="meta-item">
            <span className="meta-label">Instructor:</span>
            <span className="meta-value">{course.instructor || "LernX Expert"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="meta-value">{course.duration || "Self-paced"}</span>
          </div>
        </div>

        {isEnrolled && progress > 0 && (
          <div className="course-card-progress">
            <div className="progress-label-row">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>

      <div className="course-card-footer">
        <button
          className={`btn-course-action ${isEnrolled ? "enrolled" : ""}`}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {loading ? "Enrolling..." : isEnrolled ? "Continue Learning" : "Start Learning"}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
