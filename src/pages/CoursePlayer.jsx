import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetails, getModules, getSubModules, getVideos, getAssignments, getFinalAssignments } from "../services/courseApi";
import { getMyEnrollments } from "../services/enrollmentApi";
import { getMyCertificates, generateCertificate } from "../services/certificateApi";

import { safeRender } from "../utils/normalizeArray";
import { useAuth } from "../context/AuthContext";
import { fetchNote, saveNote } from "../services/notesApi";
import useCourseProgress from "../hooks/useCourseProgress";
import ProgressBar from "../components/ProgressBar";
import PageLoader from "../components/common/PageLoader";
import ModuleDropdown from "../components/ModuleDropdown";
import { CheckCircle, Lock, Circle, BookOpen, PlayCircle, ClipboardList, HelpCircle, Award, Lightbulb, Video, PartyPopper, Zap, Check, FileText } from "lucide-react";
import "./CoursePlayer.css";

const cleanCourseName = (name, description) => {
  return name || "";
};

const EMPTY_ARRAY = [];

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, setCertificates } = useAuth();
  const {
    progress,
    completedLessons,
    enrollmentId,
    status: enrollmentStatus,
    originalEnrollment,
    isLessonCompleted,
    markComplete,
    fetchCourseProgress,
  } = useCourseProgress(courseId);

  const completedLessonsRef = useRef(completedLessons);
  useEffect(() => {
    completedLessonsRef.current = completedLessons;
  }, [completedLessons]);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingProgress, setSubmittingProgress] = useState(false);

  const [tutorials, setTutorials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [finalAssignments, setFinalAssignments] = useState([]);
  const [certificateData, setCertificateData] = useState(null);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const notesSaveTimerRef = useRef(null);

  const [sectionsExpanded, setSectionsExpanded] = useState({});

  const [activeItem, setActiveItem] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [isReattempting, setIsReattempting] = useState(false);

  const [asmText, setAsmText] = useState("");
  const [asmLink, setAsmLink] = useState("");
  const [asmFile, setAsmFile] = useState(null);

  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittedFinal, setSubmittedFinal] = useState(false);

  const [certFormName, setCertFormName] = useState("");
  const [certFormCollege, setCertFormCollege] = useState("");
  const [certFormYear, setCertFormYear] = useState("");

  const [showCongrats, setShowCongrats] = useState(false);
  const [showCertSuccess, setShowCertSuccess] = useState(false);

  const getFlatSequence = useCallback(() => {
    const list = [];
    modules.forEach(mod => {
      tutorials.filter(t => t.moduleId === mod._id).forEach(t => list.push({ type: "tutorial", data: t, moduleId: mod._id }));
      videos.filter(v => v.subModuleId && tutorials.find(t => t._id === v.subModuleId)?.moduleId === mod._id).forEach(v => list.push({ type: "video", data: v, moduleId: mod._id }));
      quizzes.filter(q => q.moduleId === mod._id).forEach(q => list.push({ type: "quiz", data: q, moduleId: mod._id }));
      assignments.filter(a => a.moduleId === mod._id).forEach(a => list.push({ type: "assignment", data: a, moduleId: mod._id }));
    });
    tutorials.filter(t => !t.moduleId).forEach(t => list.push({ type: "tutorial", data: t }));
    videos.filter(v => !v.subModuleId || !tutorials.find(t => t._id === v.subModuleId)?.moduleId).forEach(v => list.push({ type: "video", data: v }));
    quizzes.filter(q => !q.moduleId).forEach(q => list.push({ type: "quiz", data: q }));
    assignments.filter(a => !a.moduleId).forEach(a => list.push({ type: "assignment", data: a }));
    finalAssignments.forEach(item => list.push({ type: "final-assignment", data: item }));
    return list;
  }, [modules, tutorials, videos, quizzes, assignments, finalAssignments]);

  const isCompleted = useCallback((itemId) => {
    return isLessonCompleted(itemId);
  }, [isLessonCompleted]);

  const isItemLocked = useCallback((itemType, itemId) => {
    if (progress === 100) return false;
    if (isCompleted(itemId, itemType)) return false;
    const seq = getFlatSequence();
    const idx = seq.findIndex(i => i.type === itemType && i.data._id === itemId);
    if (idx <= 0) return false;
    const prevItem = seq[idx - 1];
    return !isCompleted(prevItem.data._id, prevItem.type);
  }, [getFlatSequence, isCompleted, progress]);

  const hasNextItem = useCallback(() => {
    if (!activeItem) return false;
    const seq = getFlatSequence();
    const idx = seq.findIndex((item) => item.type === activeItem.type && item.data._id === activeItem.data._id);
    return idx !== -1 && idx < seq.length - 1;
  }, [activeItem, getFlatSequence, progress, completedLessons]);

  const handleNextItem = useCallback(() => {
    if (!activeItem) return;
    const seq = getFlatSequence();
    const idx = seq.findIndex((item) => item.type === activeItem.type && item.data._id === activeItem.data._id);
    if (idx !== -1 && idx < seq.length - 1) {
      const next = seq[idx + 1];
      setActiveItem(next);
      localStorage.setItem(`last_lesson_${courseId}`, next.data._id);
    } else {
      const currentModIdx = modules.findIndex(m => m._id === selectedModuleId);
      if (currentModIdx !== -1 && currentModIdx < modules.length - 1) {
        setSelectedModuleId(modules[currentModIdx + 1]._id);
        localStorage.removeItem(`last_lesson_${courseId}`);
      }
    }
  }, [activeItem, getFlatSequence, courseId, modules, selectedModuleId]);

  const getVideoEmbedUrl = (videoItem) => {
    if (!videoItem) return "";
    const rawUrl = videoItem.videoUrl || videoItem.video_url || videoItem.youtubeUrl || videoItem.url || videoItem.link || videoItem.contentUrl || videoItem.embedUrl || "";
    if (rawUrl && rawUrl.trim() !== "") {
      let url = rawUrl.trim();
      if (url.includes("watch?v=")) {
        url = url.replace("watch?v=", "embed/");
        const ampersandIdx = url.indexOf("&");
        if (ampersandIdx !== -1) url = url.substring(0, ampersandIdx);
      } else if (url.includes("youtu.be/")) {
        url = url.replace("youtu.be/", "youtube.com/embed/");
        const qmarkIdx = url.indexOf("?");
        if (qmarkIdx !== -1) url = url.substring(0, qmarkIdx);
      }
      return url;
    }
    return "";
  };

  const loadCourseBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const courseData = await getCourseDetails(courseId);
      setCourse(courseData);

      const enrolls = await getMyEnrollments();
      const currentEnroll = enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      if (!currentEnroll) {
        alert("Please enroll in this course first to start learning.");
        navigate(`/course/${courseId}`);
        return;
      }

      let modulesData = [];
      try {
        modulesData = await getModules(courseId);
      } catch (err) {
        console.warn("Failed fetching modules from API", err);
      }
      
      // Dynamic module count from backend
      const totalModuleCount = courseData.totalModules || courseData.moduleCount || modulesData.length || 1;
      const paddedModules = [...modulesData];
      for (let i = paddedModules.length; i < totalModuleCount; i++) {
        paddedModules.push({
          _id: `mock-mod-${i+1}`,
          title: `Module ${i+1}`,
          name: `Module ${i+1}`,
          isPlaceholder: true
        });
      }
      
      setModules(paddedModules);

      let finals = [];
      try {
        finals = await getFinalAssignments(courseId);
      } catch (err) {
        console.warn("Failed fetching final assignments", err);
      }
      setFinalAssignments(finals);

      setSelectedModuleId(prev => {
        const savedModId = localStorage.getItem(`last_module_${courseId}`);
        if (savedModId && modulesData.find(m => m._id === savedModId)) {
          return savedModId;
        }
        if (!prev && modulesData.length > 0) return modulesData[0]._id;
        return prev;
      });
      
    } catch (err) {
      console.error("Failed loading course base data", err);
    }
  }, [courseId, navigate]);

  const loadModuleData = useCallback(async (modId) => {
    if (!modId) return;
    setLoading(true);
    setTutorials([]);
    setVideos([]);
    setAssignments([]);
    setQuizzes([]);
    setActiveItem(null);
    try {
      const allSubModules = [];
      const allVideos = [];
      const allAssignments = [];
      const allQuizzes = [];

      let modObj = modules.find(m => m._id === modId) || {};
      if (modObj.quizzes && modObj.quizzes.length > 0) {
        allQuizzes.push(...modObj.quizzes.map(q => ({ ...q, moduleId: modId })));
      }
      
      if (!modObj.isPlaceholder) {
        try {
          const subs = await getSubModules(modId);
          allSubModules.push(...subs.map(s => ({ ...s, moduleId: modId })));
        } catch (err) {
          console.warn(`Failed fetching submodules for module ${modId}`, err);
        }
        try {
          const asms = await getAssignments(modId);
          allAssignments.push(...asms.map(a => ({ ...a, moduleId: modId })));
        } catch (err) {
          console.warn(`Failed fetching assignments for module ${modId}`, err);
        }
        
        for (const sub of allSubModules) {
          try {
            const vids = await getVideos(sub._id);
            allVideos.push(...vids.map(v => ({ ...v, subModuleId: sub._id })));
          } catch (err) {
            console.warn(`Failed fetching videos for submodule ${sub._id}`, err);
          }
        }
      } else {
        // AI Content Generation: Frontend Only for UI Display
        const courseTitle = course?.title || course?.name || "Topic";
        const isHtml = courseTitle.toLowerCase().includes("html");
        const isCss = courseTitle.toLowerCase().includes("css");
        const isReact = courseTitle.toLowerCase().includes("react");
        const isNode = courseTitle.toLowerCase().includes("node");
        
        let topics = ["Introduction", "Core Concepts", "Advanced Patterns"];
        if (isHtml) topics = ["What is HTML", "HTML Tags", "Forms", "Tables", "Semantic HTML"];
        else if (isCss) topics = ["CSS Introduction", "Selectors", "Flexbox", "Grid", "Responsive Design"];
        else if (isReact) topics = ["Components", "Props", "State", "Hooks", "Context API", "Routing"];
        else if (isNode) topics = ["Node Runtime", "Express", "REST API", "MongoDB", "Authentication"];

        // Add 2 tutorials based on topics
        allSubModules.push(
          { _id: `${modId}-tut-1`, name: topics[0] || "Tutorial 1", content: `<h1>${topics[0] || "Tutorial 1"}</h1><p>Welcome to this auto-generated lesson.</p>`, moduleId: modId },
          { _id: `${modId}-tut-2`, name: topics[1] || "Tutorial 2", content: `<h1>${topics[1] || "Tutorial 2"}</h1><p>Learn more about ${courseTitle}.</p>`, moduleId: modId }
        );
        // Add 1 video
        allVideos.push(
          { _id: `${modId}-vid-1`, title: `${topics[2] || "Basics"} Video`, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", subModuleId: `${modId}-tut-1` }
        );
        // Add 1 quiz
        allQuizzes.push(
          { _id: `${modId}-quiz-1`, title: `${courseTitle} Quiz`, moduleId: modId, questions: [{ questionText: `What is the main purpose of ${courseTitle}?`, options: [{optionText: "Option A", isCorrect: true}, {optionText: "Option B", isCorrect: false}] }] }
        );
        // Add 1 assignment
        allAssignments.push(
          { _id: `${modId}-ass-1`, title: `Build ${courseTitle} Project`, description: "Apply what you have learned to build a small project.", moduleId: modId }
        );
      }

      setTutorials(allSubModules);
      setVideos(allVideos);
      setAssignments(allAssignments);
      setQuizzes(allQuizzes);

      const allFlatSequence = [];
      allSubModules.forEach(i => allFlatSequence.push({ type: "tutorial", data: i, moduleId: modId }));
      allVideos.forEach(i => allFlatSequence.push({ type: "video", data: i, moduleId: modId }));
      allAssignments.forEach(i => allFlatSequence.push({ type: "assignment", data: i, moduleId: modId }));
      allQuizzes.forEach(i => allFlatSequence.push({ type: "quiz", data: i, moduleId: modId }));

      const lastLessonId = localStorage.getItem(`last_lesson_${courseId}`);
      
      let nextActive = null;
      if (lastLessonId) {
        nextActive = allFlatSequence.find(i => i.data._id === lastLessonId);
      }
      
      if (!nextActive && allFlatSequence.length > 0) {
        // Find the first unfinished lesson in this module
        // We need completedLessons to check this.
        // Wait, completedLessons is not passed to loadModuleData!
        // It's accessible via the component's scope.
        const unfinished = allFlatSequence.find(item => !completedLessonsRef.current.includes(item.data._id));
        nextActive = unfinished || allFlatSequence[0];
      }
      
      if (nextActive) {
        setActiveItem(nextActive);
      }
    } catch (err) {
      console.error("Failed loading module data", err);
    } finally {
      setLoading(false);
    }
  }, [course, courseId, modules]);

  useEffect(() => {
    if (!courseId) return;
    const loadCourseData = async () => {
      await loadCourseBaseData();
      await fetchCourseProgress(courseId);
      setLoading(false);
    };
    loadCourseData();
  }, [courseId, fetchCourseProgress, loadCourseBaseData]);

  useEffect(() => {
    if (selectedModuleId && modules.length > 0) {
      localStorage.setItem(`last_module_${courseId}`, selectedModuleId);
      loadModuleData(selectedModuleId);
    }
  }, [selectedModuleId, loadModuleData, modules, courseId]);

  useEffect(() => {
    if (activeItem && activeItem.type === "quiz") {
      const quizId = activeItem.data._id;
      const userId = user?._id || user?.email || "guest";
      const savedAttemptStr = localStorage.getItem(`${userId}_${quizId}`);
      if (savedAttemptStr) {
        setQuizAttempt(JSON.parse(savedAttemptStr));
      } else {
        setQuizAttempt(null);
      }
      setIsReattempting(false);
      setQuizAnswers({});
    }
    if (activeItem && activeItem.type === "video") {
      const videoId = activeItem.data._id;
      const userId = user?._id || user?.email || "guest";
      setNotesContent("");
      fetchNote(userId, courseId, videoId).then((content) => {
        setNotesContent(content || "");
      });
    }
  }, [activeItem, user, courseId]);

  useEffect(() => {
    if (progress === 100 && courseId) {
      const checkCerts = async () => {
        if (!certificateData) {
          try {
            const certs = await getMyCertificates();
            const earned = certs.find((c) => c.courseId?._id === courseId || c.courseId === courseId);
            if (earned) setCertificateData(earned);
          } catch (e) {
            console.warn("Could not fetch certificates automatically", e);
          }
        }
      };
      checkCerts();
    }
  }, [progress, courseId, certificateData]);

  const handleMarkComplete = async (targetItemId, itemType) => {
    console.log("STEP 1: Mark Complete button clicked", { courseId, lessonId: targetItemId, itemType });
    if (!targetItemId) {
      console.error("STEP 1 FAILED: No targetItemId");
      return;
    }
    if (isLessonCompleted(targetItemId)) {
      console.log("STEP 1: Already completed, skipping");
      return;
    }

    console.log("STEP 2: Sending request via useCourseProgress.markComplete");
    setSubmittingProgress(true);
    try {
      await markComplete(targetItemId);
      console.log("STEP 10: Mark complete succeeded, UI should re-render");
    } catch (err) {
      console.error("STEP FAILED: Error in markComplete:", err);
      alert("Failed to mark as complete.");
    } finally {
      setSubmittingProgress(false);
      console.log("STEP 11: submittingProgress reset to false");
    }
  };

  const refreshCertificates = async () => {
    try {
      const certs = await getMyCertificates();
      setCertificates(Array.isArray(certs) ? certs : []);
    } catch (err) {
      console.error("Failed to fetch my certificates", err);
    }
  };

  const refetchEnrollment = async () => {
    try {
      const enrolls = await getMyEnrollments();
      return enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId) || null;
    } catch (err) {
      console.error("Failed refetching enrollment", err);
    }
    return null;
  };

  const handleFormGenerateCert = async (e) => {
    e.preventDefault();
    const enrollment = originalEnrollment;
    if (!enrollment || progress !== 100) return;
    setSubmittingProgress(true);
    const targetCourseId = courseId || course?._id;
    try {
      const certResponse = await generateCertificate(targetCourseId, certFormName, certFormCollege, certFormYear);
      const certData = certResponse.data || certResponse;
      if (certData) setCertificateData(certData);
      await refreshCertificates();
      setShowCertSuccess(true);
    } catch (err) {
      console.error("Certificate generation failed:", err);
      if (err.response?.status === 400) {
        try {
          const certs = await getMyCertificates();
          setCertificates(Array.isArray(certs) ? certs : []);
          const earned = certs.find((c) => c.courseId?._id === targetCourseId || c.courseId === targetCourseId);
          if (earned) { setCertificateData(earned); setShowCertSuccess(true); }
        } catch (fetchErr) {
          console.error("Failed fetching existing certificate", fetchErr);
          alert("Certificate may already exist. Check your profile.");
        }
      } else {
        alert(err.response?.data?.message || err.message || "Certificate generation failed");
      }
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const questions = activeItem.data.questions || [];
    const unanswered = questions.some((_, qIndex) => !quizAnswers[`${activeItem.data._id}-${qIndex}`]);
    if (unanswered) { alert("Please answer all questions before submitting."); return; }
    let correctCount = 0;
    questions.forEach((q, qIndex) => {
      if (quizAnswers[`${activeItem.data._id}-${qIndex}`] === q.answer) correctCount++;
    });
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = percentage >= 75;
    const attempt = { score: correctCount, total, percentage, passed, attemptedAt: new Date().toISOString() };
    const quizId = activeItem.data._id;
    const userId = user?._id || user?.email || "guest";
    localStorage.setItem(`${userId}_${quizId}`, JSON.stringify(attempt));
    setQuizAttempt(attempt);
    setIsReattempting(false);
    if (passed) {
      await handleMarkComplete(activeItem.data._id, "quiz");
    } else {
      await refetchEnrollment();
    }
  };

  const handleSubmitAssignment = async () => {
    if (!asmText.trim() && !asmLink.trim() && !asmFile) {
      alert("Please write your answer, paste a Google Drive link, or upload a file."); return;
    }
    setSubmittingProgress(true);
    try {
      await handleMarkComplete(activeItem.data._id, "assignment");
      alert("Assignment submitted successfully");
      setAsmText(""); setAsmLink(""); setAsmFile(null);
    } catch (err) {
      console.error(err); alert("Failed to submit assignment.");
    } finally { setSubmittingProgress(false); }
  };

  const handleSubmitFinalAssignment = async () => {
    if (!submissionLink.trim() && !submissionFile) {
      alert("Please upload a file or paste a Google Drive link before submitting."); return;
    }
    setSubmittingProgress(true);
    try {
      await markComplete(activeItem.data._id);
      setSubmittedFinal(true);
      setShowCongrats(true);
    } catch (err) {
      console.error(err); alert("Failed to submit assignment.");
    } finally { setSubmittingProgress(false); }
  };

  const isCertificateUnlocked = () => progress === 100;
  const isUnlocked = isCertificateUnlocked();

  const toggleSection = (sectionName) => {
    setSectionsExpanded((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const renderMarkCompleteBtn = (itemId, itemType) => {
    const done = isCompleted(itemId, itemType);
    if (done) {
      return (
        <button className="btn-complete-sub completed" disabled>
          ✓ Completed
        </button>
      );
    }
    return (
      <button className="btn-complete-sub" onClick={() => handleMarkComplete(itemId, itemType)} disabled={submittingProgress}>
        {submittingProgress ? "Recording..." : "Mark Complete"}
      </button>
    );
  };

  if (loading) {
    return <PageLoader text="Preparing Course Player..." />;
  }

  return (
    <div className="lms-player-container">
      <aside className="player-sidebar-wrapper">
        <div className="sidebar-header">
          <h3 className="course-sidebar-title">{cleanCourseName(course?.name, course?.description)}</h3>
          <div className="sidebar-progress-container">
            <div className="progress-info">
              <span>Course Progress</span>
              <span className="progress-value">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        </div>

        {modules.length > 0 && (
          <div className="sidebar-module-selector">
            <ModuleDropdown
              modules={modules}
              selectedModuleId={selectedModuleId}
              onSelect={setSelectedModuleId}
            />
          </div>
        )}

        <nav className="sidebar-syllabus">
          {(() => {
            const renderItems = (items, type, label, icon) => {
              if (!items.length) return null;
              const catKey = `${selectedModuleId}-${type}`;
              const isCatExpanded = sectionsExpanded[catKey] !== false;
              return (
                <div className="sub-category-group">
                  <button className={`sub-category-trigger ${isCatExpanded ? "expanded" : ""}`} onClick={() => toggleSection(catKey)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="trigger-icon" style={{ display: 'flex', alignItems: 'center', color: '#6366f1' }}>{icon}</span>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                    </div>
                    <span className="expand-chevron" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{isCatExpanded ? "▼" : "▶"}</span>
                  </button>
                  {isCatExpanded && (
                    <ul className="submodule-list">
                      {items.map((item) => {
                        const isSelected = activeItem?.type === type && activeItem.data._id === item._id;
                        const done = isCompleted(item._id, type);
                        const locked = isItemLocked(type, item._id);
                        return (
                          <li key={item._id}>
                            <button className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""} ${locked ? "locked" : ""}`}
                              onClick={() => { if (!locked) { setActiveItem({ type, data: item }); localStorage.setItem(`last_lesson_${courseId}`, item._id); } }}
                              disabled={locked}>
                              <span className={`icon-prefix ${done ? "completed-tick" : ""}`} style={{ color: done ? '#10b981' : locked ? '#9ca3af' : '#6366f1' }}>
                                {done ? <CheckCircle size={14} /> : locked ? <Lock size={14} /> : <Circle size={14} />}
                              </span>
                              <span className="item-text" style={{ fontWeight: isSelected ? 600 : 400 }}>{item.name || item.title || `${label} ${items.indexOf(item) + 1}`}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            };

            return (
              <div className="module-content">
                {renderItems(tutorials, "tutorial", "Tutorial", <BookOpen size={16}/>)}
                {renderItems(videos, "video", "Video", <PlayCircle size={16}/>)}
                {renderItems(assignments, "assignment", "Task", <ClipboardList size={16}/>)}
                {renderItems(quizzes, "quiz", "Quiz", <HelpCircle size={16}/>)}
              </div>
            );
          })()}

          {finalAssignments.length > 0 && (
            <div className="module-accordion">
              <button className="module-trigger" onClick={() => toggleSection("finalAssignment")} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="module-title"><ClipboardList size={16} /> Final Assignment</span>
                <span className="expand-chevron" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{sectionsExpanded.finalAssignment !== false ? "▼" : "▶"}</span>
              </button>
              {sectionsExpanded.finalAssignment !== false && (
                <ul className="submodule-list">
                  {finalAssignments.map((final) => {
                    const isSelected = activeItem?.type === "final-assignment" && activeItem.data._id === final._id;
                    const done = isCompleted(final._id, "final-assignment");
                    const locked = isItemLocked("final-assignment", final._id);
                    return (
                      <li key={final._id}>
                        <button className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""} ${locked ? "locked" : ""}`}
                          onClick={() => { if (!locked) setActiveItem({ type: "final-assignment", data: final }); }}
                          disabled={locked}>
                          <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                            {done ? <CheckCircle size={14} /> : locked ? <Lock size={14} /> : <Circle size={14} />}
                          </span>
                          <span className="item-text">{final.title || final.name || "Final Task"}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          <div className="sidebar-certificate-row">
            {!isUnlocked ? (
              <div className="certificate-item locked">
                <span className="icon-prefix"><Lock size={16} /></span>
                <span className="item-text">Complete all to unlock certificate</span>
              </div>
            ) : certificateData ? (
              <button className={`certificate-item unlocked ${activeItem?.type === "certificate" ? "active" : ""}`}
                onClick={() => navigate('/profile', { state: { tab: 'certificates', highlightCert: certificateData._id } })}>
                <span className="icon-prefix"><Award size={16} /></span>
                <span className="item-text">View Certificate</span>
              </button>
            ) : (
              <button className={`certificate-item unlocked claimable ${activeItem?.type === "certificate-form" ? "active" : ""}`}
                onClick={() => setActiveItem({ type: "certificate-form", data: {} })} disabled={submittingProgress}>
                <span className="icon-prefix"><Award size={16} /></span>
                <span className="item-text">Generate Certificate</span>
              </button>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-leave-player" onClick={() => navigate(`/course/${courseId}`)}>← Leave Player</button>
        </div>
      </aside>

      <main className="player-content-area">
        <header className="player-top-bar">
          <div className="player-course-info">
            <h2 className="player-top-course-title">{cleanCourseName(course?.name, course?.description)}</h2>
            <div className="player-header-progress">
              <span>Progress: {progress}%</span>
              <ProgressBar progress={progress} />
            </div>
          </div>
        </header>

        <div className="player-viewport">
          {activeItem ? (
            <div className="submodule-content-card">
              {activeItem.type === "tutorial" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag"><BookOpen size={16} /> Tutorial</span>
                    <h1>{activeItem.data.name}</h1>
                  </div>
                  <div className="tab-viewport-body">
                    <div className="tutorial-markup">
                      <p>
                        {safeRender(
                          activeItem.data.content || activeItem.data.description || "No content provided for this tutorial."
                        )}
                      </p>
                      <div className="tutorial-box"><Lightbulb size={16} style={{marginRight:6}}/> <strong>LernX Tip:</strong> Try recreating concepts covered in these materials locally.</div>
                    </div>
                  </div>
                </div>
              )}

              {activeItem.type === "video" && (() => {
                const currentTopic = tutorials.find(t => t._id === activeItem.data.subModuleId) || {};
                const topicTitle = currentTopic.name || currentTopic.title || activeItem.data.title;
                const embedUrl = getVideoEmbedUrl(activeItem.data, currentTopic);
                return (
                  <div className="submodule-detail-body">
                    <div className="submodule-header">
                      <span className="current-node-tag"><Video size={16} /> Video Lesson</span>
                      <h1>{topicTitle}</h1>
                      <div className="video-meta">Duration: {activeItem.data.duration || "N/A"}</div>
                    </div>
                    <div className="tab-viewport-body">
                      {embedUrl ? (
                        <div className="video-player-frame">
                          <iframe className="html5-video-player" src={embedUrl} title={topicTitle}
                            allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                        </div>
                      ) : (
                        <div className="video-player-frame empty-video-state">
                          <span className="empty-video-icon"><Video size={48} color="#64748b" /></span>
                          <h3>Video Unavailable</h3>
                          <p>This video is being processed. Review lesson notes or continue.</p>
                        </div>
                      )}
                      <p className="video-description-text">{activeItem.data.description || "Watch the video fully before completing."}</p>
                    </div>
                  </div>
                );
              })()}

              {activeItem.type === "assignment" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag"><ClipboardList size={16} /> Assignment</span>
                    <h1>{activeItem.data.title}</h1>
                    <div className="video-meta">Max Marks: {activeItem.data.maxMarks || 100}</div>
                  </div>
                  <div className="tab-viewport-body">
                    <div className="assignment-card-item">
                      <p className="asm-desc">{activeItem.data.description}</p>
                    </div>
                    {isCompleted(activeItem.data._id, "assignment") ? (
                      <div className="completed-success-banner">
                        <span className="success-icon"><Check size={16} /></span>
                        <span>Assignment submitted! Marked as complete.</span>
                      </div>
                    ) : (
                      <>
                        <div className="assignment-submission-form">
                          <h3>Submit Your Work</h3>
                          <div className="form-group">
                            <label>Write your answer</label>
                            <textarea className="answer-area" placeholder="Type your answer here..." rows="4"
                              value={asmText} onChange={(e) => setAsmText(e.target.value)}></textarea>
                          </div>
                          <div className="form-separator"><span>OR</span></div>
                          <div className="form-group">
                            <label>Google Drive link</label>
                            <input type="url" className="form-input" placeholder="https://drive.google.com/..."
                              value={asmLink} onChange={(e) => setAsmLink(e.target.value)} />
                          </div>
                          <div className="form-separator"><span>OR</span></div>
                          <div className="form-group">
                            <label>Upload File</label>
                            <input type="file" accept=".pdf,.zip,.rar,.txt" onChange={(e) => setAsmFile(e.target.files[0])} />
                            {asmFile && <span className="file-name">{asmFile.name}</span>}
                          </div>
                          <button className="btn-complete-sub" onClick={handleSubmitAssignment} disabled={submittingProgress}
                            style={{ marginTop: "1rem", alignSelf: "flex-end" }}>
                            {submittingProgress ? "Submitting..." : "Submit Assignment"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeItem.type === "quiz" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag"><HelpCircle size={16} /> Quiz</span>
                    <h1>{activeItem.data.title || "Topic Assessment"}</h1>
                  </div>
                  <div className="tab-viewport-body">
                    {quizAttempt && !isReattempting ? (
                      <div className="quiz-result-dashboard">
                        <div className={`scorecard-card ${quizAttempt.passed ? "passed" : "failed"}`}>
                          <h3>Quiz Results</h3>
                          <div className="scorecard-stats">
                            <div>Questions: <strong>{quizAttempt.total}</strong></div>
                            <div>Correct: <strong>{quizAttempt.score}</strong></div>
                            <div>Score: <strong>{quizAttempt.score}/{quizAttempt.total}</strong></div>
                            <div>Percentage: <strong>{quizAttempt.percentage}%</strong></div>
                          </div>
                          <div className={`quiz-status-msg ${quizAttempt.passed ? "pass" : "fail"}`}>
                            {quizAttempt.passed ? "✓ Passed" : "✗ Failed"}
                          </div>
                          <button className="btn-reattempt-quiz" onClick={() => setIsReattempting(true)}>
                            Reattempt Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {activeItem.data.questions?.length > 0 ? (
                          activeItem.data.questions.map((q, qIndex) => (
                            <div className="quiz-card" key={qIndex}>
                              <h4>{qIndex + 1}. {q.question}</h4>
                              <div className="quiz-options">
                                {q.options?.map((opt, oIndex) => (
                                  <label key={oIndex} className="quiz-option">
                                    <input type="radio" name={`quiz-${activeItem.data._id}-${qIndex}`} value={opt}
                                      checked={quizAnswers[`${activeItem.data._id}-${qIndex}`] === opt}
                                      onChange={() => setQuizAnswers(prev => ({ ...prev, [`${activeItem.data._id}-${qIndex}`]: opt }))} />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>No questions configured for this quiz.</p>
                        )}
                        {activeItem.data.questions?.length > 0 && (
                          <div className="content-item-action-row">
                            <button className="btn-complete-sub" onClick={handleSubmitQuiz}>Submit Quiz</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeItem.type === "final-assignment" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag"><Award size={16} /> Final Assessment</span>
                    <h1>{activeItem.data.title || "Final Exam"}</h1>
                    {activeItem.data.maxMarks && <div className="video-meta">Max Marks: {activeItem.data.maxMarks}</div>}
                  </div>
                  <div className="tab-viewport-body">
                    <div className="assignment-card-item">
                      <p className="asm-desc">{activeItem.data.description || "Complete the final project to earn your certificate."}</p>
                    </div>
                    {isCompleted(activeItem.data._id, "final-assignment") || submittedFinal ? (
                      <div className="completed-success-banner">
                        <span className="success-icon"><Check size={16} /></span>
                        <span>Final assignment submitted! Progress complete.</span>
                      </div>
                    ) : (
                      <>
                        <div className="assignment-upload-area">
                          <div className="form-group">
                            <label>Submission Link</label>
                            <input type="url" className="form-input" placeholder="Paste your Google Drive link..."
                              value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Upload File (ZIP/PDF)</label>
                            <input type="file" accept=".pdf,.zip,.rar" onChange={(e) => setSubmissionFile(e.target.files[0])} />
                            {submissionFile && <span className="file-name">{submissionFile.name}</span>}
                          </div>
                        </div>
                        <div className="content-item-action-row">
                          <button className="btn-complete-sub" onClick={handleSubmitFinalAssignment} disabled={submittingProgress}>
                            {submittingProgress ? "Submitting..." : "Submit Final Assignment"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeItem.type === "certificate" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag"><Award size={16} /> Certificate</span>
                    <h1>Credential: {activeItem.data._id}</h1>
                  </div>
                  <div className="tab-viewport-body" style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ marginBottom: "1.5rem" }}>Congratulations! You have completed all requirements.</p>
                    <button className="btn-primary-action btn-continue"
                      onClick={() => navigate("/certificate", { state: { cert: activeItem.data, course } })}>
                      View Certificate Page
                    </button>
                  </div>
                </div>
              )}

              {activeItem.type === "certificate-form" && (
                <div className="submodule-detail-body">
                  <div className="certificate-generation-form-card">
                    <h2><Award size={24} style={{marginRight:8}}/> Request Certificate</h2>
                    {certificateData ? (
                      <div className="success-message" style={{ textAlign: "center", padding: "1.5rem" }}>
                        <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "1.5rem" }}>✓ Certificate generated!</p>
                        <button className="btn-primary-action btn-continue"
                          onClick={() => navigate("/certificate/preview", { state: { cert: certificateData, course } })}>
                          View Certificate
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleFormGenerateCert}>
                        <div className="form-group">
                          <label>Full Name</label>
                          <input type="text" required className="form-input" placeholder="Your full name"
                            value={certFormName} onChange={(e) => setCertFormName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Institution</label>
                          <input type="text" required className="form-input" placeholder="Your college/institution"
                            value={certFormCollege} onChange={(e) => setCertFormCollege(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Graduation Year</label>
                          <input type="text" required className="form-input" placeholder="e.g. 2026"
                            value={certFormYear} onChange={(e) => setCertFormYear(e.target.value)} />
                        </div>
                        <button type="submit" className="btn-submit-cert" disabled={submittingProgress}>
                          {submittingProgress ? "Generating..." : "Generate Certificate"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {activeItem.type !== "certificate" && activeItem.type !== "certificate-form" && (
                <div className="player-bottom-navigation-bar">
                  <button className="btn-player-back-nav" onClick={() => navigate(`/course/${courseId}`)}>← Back</button>
                  <div className="player-nav-right-buttons">
                    {activeItem.type !== "quiz" && activeItem.type !== "final-assignment" && renderMarkCompleteBtn(activeItem.data._id, activeItem.type)}
                    {hasNextItem() && (
                      <button className="btn-player-next" onClick={handleNextItem}>Next ➡</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="player-welcome-panel">
              <div className="welcome-player-card">
                <div className="welcome-icon"><Zap size={48} /></div>
                <h1>Welcome to {cleanCourseName(course?.name, course?.description) || "LernX"}</h1>
                <p>Select an item from the sidebar to start learning.</p>
                <div className="welcome-prog-box">
                  <span>Progress:</span>
                  <strong>{progress}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCongrats && (
        <div className="congrats-modal-overlay">
          <div className="congrats-modal-card">
            <span className="congrats-emoji"><PartyPopper size={48} /></span>
            <h2>Congratulations!</h2>
            <p>You completed</p>
            <h3>{cleanCourseName(course?.name, course?.description)}</h3>
            <button className="btn-congrats-generate-cert" onClick={() => { setShowCongrats(false); setActiveItem({ type: "certificate-form" }); }}>
              Generate Certificate
            </button>
          </div>
        </div>
      )}

      {showCertSuccess && (
        <div className="congrats-modal-overlay">
          <div className="congrats-modal-card">
            <span className="congrats-emoji"><PartyPopper size={48} /></span>
            <h2>Certificate Generated!</h2>
            <p>Your credential for</p>
            <h3>{cleanCourseName(course?.name, course?.description)}</h3>
            <div className="modal-actions">
              <button className="btn-congrats-generate-cert" onClick={() => { setShowCertSuccess(false); navigate("/profile#certificates"); }}>
                View in Profile
              </button>
              <button className="btn-congrats-generate-cert secondary" onClick={() => setShowCertSuccess(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {(() => {
        if (!activeItem) return null;
        const currentModule = modules.find(m => m._id === activeItem.moduleId);
        if (!currentModule || !currentModule.notes) return null;
        return (
          <div className="player-notes-wrapper">
            <button className="notes-launcher" onClick={() => setIsNotesOpen(!isNotesOpen)}>
              <span><FileText size={20} /></span>
            </button>
            <div className={`notes-panel ${isNotesOpen ? "open" : "closed"}`}>
              <div className="notes-header">
                <div className="notes-header-info">
                  <h3>Course Material</h3>
                  <p>Notes provided by the instructor</p>
                </div>
                <button className="notes-close" onClick={() => setIsNotesOpen(false)}>&times;</button>
              </div>
              <div className="notes-body">
                <div className="module-provided-notes" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {currentModule.notes}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CoursePlayer;
