import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetails, getModules, getSubModules, getVideos, getAssignments, getFinalAssignments } from "../services/courseApi";
import { getMyEnrollments, updateProgress } from "../services/enrollmentApi";
import { getMyCertificates, generateCertificate } from "../services/certificateApi";
import { getFallbackContent, generateQuiz, generateFinalAssignment, getCourseVideo } from "../utils/fallbackContent";
import { normalizeArray, safeRender } from "../utils/normalizeArray";
import { useAuth } from "../context/AuthContext";
import { fetchNote, saveNote } from "../services/notesApi";
import ProgressBar from "../components/ProgressBar";
import PageLoader from "../components/common/PageLoader";
import "./CoursePlayer.css";

const cleanCourseName = (name, description) => {
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
  if (name === "Tutorials" || name === "Videos" || name === "Assignments" || name === "Quizzes" || name === "Projects") {
    if (description && description.includes("HTML")) return "HTML";
    if (description && description.includes("CSS")) return "CSS";
    if (description && description.includes("JavaScript")) return "JavaScript";
    if (description && description.includes("React")) return "React";
    if (description && description.includes("Node")) return "Node.js";
  }
  return name || "";
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token, setCertificates } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isFallback, setIsFallback] = useState(false);

  // Grouped content states
  const [tutorials, setTutorials] = useState([]);      // submodules
  const [videos, setVideos] = useState([]);            // videos
  const [assignments, setAssignments] = useState([]);    // assignments
  const [modules, setModules] = useState([]);          // modules
  const [quizzes, setQuizzes] = useState([]);          // quizzes from modules
  const [finalAssignments, setFinalAssignments] = useState([]);
  const [certificateData, setCertificateData] = useState(null);

  // Notes Feature states
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const notesSaveTimerRef = useRef(null);

  // Accordion toggle states
  const [sectionsExpanded, setSectionsExpanded] = useState({
    tutorials: true,
    videos: true,
    assignments: true,
    quizzes: true,
    finalAssignment: true,
  });

  // Current active viewport content
  const [activeItem, setActiveItem] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Quiz attempts state
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [isReattempting, setIsReattempting] = useState(false);

  // Assignment states
  const [asmText, setAsmText] = useState("");
  const [asmLink, setAsmLink] = useState("");
  const [asmFile, setAsmFile] = useState(null);

  // Final assignment states
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittedFinal, setSubmittedFinal] = useState(false);

  // Certificate generation forms
  const [certFormName, setCertFormName] = useState("");
  const [certFormCollege, setCertFormCollege] = useState("");
  const [certFormYear, setCertFormYear] = useState("");

  // Congratulations Modal state
  const [showCongrats, setShowCongrats] = useState(false);

  // Certificate success modal state
  const [showCertSuccess, setShowCertSuccess] = useState(false);

  useEffect(() => {
    fetchCompleteSyllabusChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

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

    // Notes logic — load from API (with localStorage fallback inside service)
    if (activeItem && activeItem.type === "video") {
      const videoId = activeItem.data._id;
      const userId = user?._id || user?.email || "guest";
      setNotesContent("");
      fetchNote(userId, courseId, videoId).then((content) => {
        setNotesContent(content || "");
      });
    }
  }, [activeItem, user, courseId]);

  const getVideoEmbedUrl = (videoItem, currentTopic) => {
    if (!videoItem) return "";
    
    const isFallback = videoItem._id && videoItem._id.includes("-vid-");
    const rawUrl = videoItem.videoUrl || videoItem.video_url || videoItem.youtubeUrl || videoItem.url || videoItem.link || videoItem.contentUrl || videoItem.embedUrl || "";
    const hasRealVideo = rawUrl && rawUrl.trim() !== "" && !rawUrl.includes("dQw4w9WgXcQ") && !rawUrl.includes("dQw4w9");

    const cTitle = course?.title || course?.name || "";
    const tTitle = currentTopic?.name || currentTopic?.title || videoItem.title || "";

    if (!isFallback && hasRealVideo) {
      let url = rawUrl.trim();
      if (url.includes("watch?v=")) {
        url = url.replace("watch?v=", "embed/");
        // Remove trailing query params like &list=
        const ampersandIdx = url.indexOf("&");
        if (ampersandIdx !== -1) {
          url = url.substring(0, ampersandIdx);
        }
      } else if (url.includes("youtu.be/")) {
        url = url.replace("youtu.be/", "youtube.com/embed/");
        const qmarkIdx = url.indexOf("?");
        if (qmarkIdx !== -1) {
          url = url.substring(0, qmarkIdx);
        }
      }
      return url;
    }

    return getCourseVideo(cTitle, tTitle);
  };

  const fetchCompleteSyllabusChain = async () => {
    setLoading(true);
    // Clear previous course states to prevent cross-contamination
    setCourse(null);
    setEnrollment(null);
    setTutorials([]);
    setVideos([]);
    setAssignments([]);
    setQuizzes([]);
    setFinalAssignments([]);
    setCertificateData(null);
    setActiveItem(null);
    setQuizAnswers({});
    setIsFallback(false);

    try {
      // 1. Fetch course metadata
      const courseData = await getCourseDetails(courseId);
      setCourse(courseData);

      // 2. Fetch enrollment and progress
      const enrolls = await getMyEnrollments();
      const currentEnroll = enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      if (!currentEnroll) {
        alert("Please enroll in this course first to start learning.");
        navigate(`/course/${courseId}`);
        return;
      }
      setEnrollment(currentEnroll);

      // 3. Step 1: Fetch modules
      let modulesData = [];
      try {
        modulesData = await getModules(courseId);
      } catch (err) {
        console.warn("Failed fetching modules from API", err);
      }

      // 4. Steps 2, 3, & 4: Fetch submodules, videos, and assignments in sequence
      const allSubModules = [];
      const allVideos = [];
      const allAssignments = [];
      const allQuizzes = [];

      if (modulesData && modulesData.length > 0) {
        for (const mod of modulesData) {
          // Collect quizzes inside module
          if (mod.quizzes && mod.quizzes.length > 0) {
            allQuizzes.push(...mod.quizzes.map(q => ({ ...q, moduleId: mod._id })));
          }

          try {
            const subs = await getSubModules(mod._id);
            allSubModules.push(...subs.map(s => ({ ...s, moduleId: mod._id })));
          } catch (err) {
            console.warn(`Failed fetching submodules for module ${mod._id}`, err);
          }

          try {
            const asms = await getAssignments(mod._id);
            allAssignments.push(...asms.map(a => ({ ...a, moduleId: mod._id })));
          } catch (err) {
            console.warn(`Failed fetching assignments for module ${mod._id}`, err);
          }
        }

        // Fetch videos for each submodule
        for (const sub of allSubModules) {
          try {
            const vids = await getVideos(sub._id);
            allVideos.push(...vids.map(v => ({ ...v, subModuleId: sub._id })));
          } catch (err) {
            console.warn(`Failed fetching videos for submodule ${sub._id}`, err);
          }
        }
      }

      // 5. Step 5: Fetch final assignment
      let finals = [];
      try {
        finals = await getFinalAssignments(courseId);
      } catch (err) {
        console.warn("Failed fetching final assignments", err);
      }

      // Load fallback content database
      const fallback = getFallbackContent(courseData ? (courseData.title || courseData.name) : "", courseId);
      let loadedFallback = false;

      const courseTitle = courseData ? (courseData.title || courseData.name) : "";

      // Merge in fallback if any section returns empty
      if (modulesData.length === 0) {
        loadedFallback = true;
        modulesData = fallback.modules;
      }
      if (allSubModules.length === 0) {
        loadedFallback = true;
        allSubModules.push(...fallback.subModules);
      }
      if (allVideos.length === 0) {
        loadedFallback = true;
        allVideos.push(...fallback.videos);
      }
      if (allAssignments.length === 0) {
        loadedFallback = true;
        allAssignments.push(...fallback.assignments);
      }
      if (allQuizzes.length === 0) {
        loadedFallback = true;
        allQuizzes.push(...fallback.quizzes.map(q => ({
          ...q,
          questions: generateQuiz(courseTitle)
        })));
      } else {
        allQuizzes.forEach(q => {
          q.questions = generateQuiz(courseTitle);
        });
      }
      if (finals.length === 0) {
        loadedFallback = true;
        finals = fallback.finalAssignments.map(f => {
          const dynamicAssignment = generateFinalAssignment(courseTitle);
          return {
            ...f,
            title: dynamicAssignment.title,
            description: dynamicAssignment.description,
            requirements: dynamicAssignment.requirements,
            deliverable: dynamicAssignment.deliverable
          };
        });
      } else {
        finals = finals.map(f => {
          const dynamicAssignment = generateFinalAssignment(courseTitle);
          return {
            ...f,
            title: dynamicAssignment.title,
            description: dynamicAssignment.description,
            requirements: dynamicAssignment.requirements,
            deliverable: dynamicAssignment.deliverable
          };
        });
      }

      setIsFallback(loadedFallback);
      setTutorials(allSubModules);
      setVideos(allVideos);
      setAssignments(allAssignments);
      setModules(modulesData);
      setQuizzes(allQuizzes);
      setFinalAssignments(finals);

      // Course items list — used for sidebar display only (backend tracks actual progress)

      // Re-fetch enrollment to get enriched local progress sync immediately
      const enrichedEnrolls = await getMyEnrollments();
      const enrichedEnroll = enrichedEnrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      const activeEnroll = enrichedEnroll || currentEnroll;
      setEnrollment(activeEnroll);

      // Set initial item to first tutorial if available
      if (allSubModules.length > 0) {
        setActiveItem({ type: "tutorial", data: allSubModules[0] });
      }

      // Fetch certificate if progress is 100%
      const initialProgress = activeEnroll.progress !== undefined ? activeEnroll.progress : 0;
      if (initialProgress === 100) {
        const certs = await getMyCertificates();
        const earned = certs.find((c) => c.courseId?._id === courseId || c.courseId === courseId);
        if (earned) setCertificateData(earned);
      }
    } catch (err) {
      console.error("Failed executing sequence curriculum chains", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (targetItemId, itemType) => {
    if (!enrollment) return;
    
    // Guard: Never allow duplicate completions
    const completedList = enrollment.completedSubModules || [];
    if (completedList.includes(targetItemId)) {
      return;
    }

    setSubmittingProgress(true);

    let apiModuleId = targetItemId;
    if (String(apiModuleId).startsWith(courseId)) {
      const realTut = tutorials.find((t) => !t._id.startsWith(courseId));
      apiModuleId = realTut ? realTut._id : null;
    }

    try {
      if (apiModuleId) {
        await updateProgress(enrollment._id, apiModuleId);
      }
      
      // Optimistic instant update for UI
      const newCompletedList = [...completedList, targetItemId];
      
      // Re-fetch enrollment to get updated progressPercentage from backend
      const enrolls = await getMyEnrollments();
      const currentEnroll = enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      
      if (currentEnroll) {
        // Ensure local list maps even if backend is delayed
        currentEnroll.completedSubModules = Array.from(new Set([...(currentEnroll.completedSubModules || []), ...newCompletedList]));
        setEnrollment(currentEnroll);

        // Certificate check handles via new useEffect automatically
      } else {
        setEnrollment({
          ...enrollment,
          completedSubModules: newCompletedList
        });
      }
    } catch (err) {
      console.error("Failed saving completion progress on backend", err);
      setEnrollment({
        ...enrollment,
        completedSubModules: [...completedList, targetItemId]
      });
    } finally {
      setSubmittingProgress(false);
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

  // Refetch enrollment from backend — single source of truth for progress
  const refetchEnrollment = async () => {
    try {
      const enrolls = await getMyEnrollments();
      const currentEnroll = enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      if (currentEnroll) {
        setEnrollment(currentEnroll);
        return currentEnroll;
      }
    } catch (err) {
      console.error("Failed refetching enrollment", err);
    }
    return null;
  };

  const handleFormGenerateCert = async (e) => {
    e.preventDefault();
    if (!enrollment || progress !== 100) return;
    setSubmittingProgress(true);

    const targetCourseId = courseId || course?._id;

    try {
      // Use existing certificateApi service — no raw fetch
      const certResponse = await generateCertificate(targetCourseId, certFormName, certFormCollege, certFormYear);
      const certData = certResponse.data || certResponse;
      if (certData) setCertificateData(certData);

      // Refresh certificates in AuthContext so Profile sees it immediately
      await refreshCertificates();

      // Show success modal
      setShowCertSuccess(true);
    } catch (err) {
      console.error("Certificate generation failed:", err);
      // If 400 (already exists), try fetching the existing cert
      if (err.response?.status === 400) {
        try {
          const certs = await getMyCertificates();
          setCertificates(Array.isArray(certs) ? certs : []);
          const earned = certs.find((c) => c.courseId?._id === targetCourseId || c.courseId === targetCourseId);
          if (earned) {
            setCertificateData(earned);
            setShowCertSuccess(true);
          }
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
    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let correctCount = 0;
    questions.forEach((q, qIndex) => {
      const selected = quizAnswers[`${activeItem.data._id}-${qIndex}`];
      if (selected === q.answer) {
        correctCount++;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = percentage >= 75;

    const attempt = {
      score: correctCount,
      total,
      percentage,
      passed,
      attemptedAt: new Date().toISOString()
    };

    const quizId = activeItem.data._id;
    const userId = user?._id || user?.email || "guest";
    // Store quiz attempt in memory only (localStorage kept for quiz result display persistence)
    localStorage.setItem(`${userId}_${quizId}`, JSON.stringify(attempt));
    setQuizAttempt(attempt);
    setIsReattempting(false);

    if (passed) {
      await handleMarkComplete(activeItem.data._id, "quiz");
    } else {
      // Re-fetch enrollment from backend to sync progress
      await refetchEnrollment();
    }
  };

  const handleSubmitAssignment = async () => {
    if (!asmText.trim() && !asmLink.trim() && !asmFile) {
      alert("Please write your answer, paste a Google Drive link, or upload a file.");
      return;
    }
    setSubmittingProgress(true);
    try {
      await handleMarkComplete(activeItem.data._id, "assignment");
      alert("Assignment submitted successfully");
      setAsmText("");
      setAsmLink("");
      setAsmFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit assignment.");
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleSubmitFinalAssignment = async () => {
    if (!submissionLink.trim() && !submissionFile) {
      alert("Please upload a file or paste a Google Drive link before submitting.");
      return;
    }
    setSubmittingProgress(true);

    const enrollmentId = enrollment?._id;
    const finalAssignmentSubModuleId = activeItem.data._id;
    const authToken = token || localStorage.getItem("token") || localStorage.getItem("userToken");

    console.log("--- FINAL ASSIGNMENT SUBMISSION CHECKLIST ---");
    console.log("Log enrollmentId:", enrollmentId);
    console.log("Log finalAssignmentSubModuleId:", finalAssignmentSubModuleId);
    console.log("Log token:", authToken ? `Bearer ${authToken.substring(0, 15)}...` : "NOT FOUND");

    try {
      // 1. Mark final assignment complete on backend
      const isFallbackId = finalAssignmentSubModuleId.startsWith(courseId);
      let apiSubModuleId = finalAssignmentSubModuleId;

      if (isFallbackId) {
        const realSub = tutorials.find((t) => !t._id.startsWith(courseId));
        apiSubModuleId = realSub ? realSub._id : null;
      }

      let putResponseStatus = null;
      if (apiSubModuleId) {
        console.log(`Sending PUT progress with subModuleId: ${apiSubModuleId}`);
        try {
          const putRes = await updateProgress(enrollmentId, apiSubModuleId);
          putResponseStatus = 200;
          console.log("Log PUT response status: 200 (Success)");
          console.log("PUT Response data:", putRes);
        } catch (apiErr) {
          console.error("PUT progress request failed:", apiErr);
          putResponseStatus = apiErr.response?.status || 500;
          console.log("Log PUT response status:", putResponseStatus);
        }
      } else {
        console.log("Skipping progress PUT call because there is no database submodule mapping.");
      }

      // 3. Re-fetch enrollments to refresh progress in player
      const enrolls = await getMyEnrollments();
      const currentEnroll = enrolls.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
      console.log("Log GET /enrollments/me response progress:", currentEnroll?.progress);
      
      if (currentEnroll) {
        setEnrollment(currentEnroll);
        
        // Fetch certificate if progress is 100%
        if (currentEnroll.progress === 100) {
          const certs = await getMyCertificates();
          const earned = certs.find((c) => c.courseId?._id === courseId || c.courseId === courseId);
          if (earned) setCertificateData(earned);
        }
      }

      setSubmittedFinal(true);
      setShowCongrats(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit assignment.");
    } finally {
      setSubmittingProgress(false);
    }
  };

  const isCompleted = (itemId, itemType) => {
    if (!enrollment) return false;
    const completedList = enrollment.completedSubModules || [];

    if (itemType === "quiz") {
      const quizId = itemId;
      const userId = user?._id || user?.email || "guest";
      const savedAttemptStr = localStorage.getItem(`${userId}_${quizId}`);
      if (savedAttemptStr) {
        const attempt = JSON.parse(savedAttemptStr);
        if (!attempt.passed) return false;
      }
    }

    if (itemType === "tutorial") {
      return completedList.includes(itemId);
    } else if (itemType === "video") {
      if (itemId === `${courseId}-vid-1`) {
        return completedList.includes(itemId);
      }
      const vid = videos.find((v) => v._id === itemId);
      return vid ? (completedList.includes(vid._id) || completedList.includes(vid.subModuleId)) : false;
    } else if (itemType === "assignment") {
      if (itemId.startsWith(`${courseId}-asm-`)) {
        return completedList.includes(itemId);
      }
      const asm = assignments.find((a) => a._id === itemId);
      const sub = tutorials.find((s) => s.moduleId === asm?.moduleId);
      return sub ? (completedList.includes(asm._id) || completedList.includes(sub._id)) : false;
    } else if (itemType === "quiz") {
      if (itemId === `${courseId}-quiz-1`) {
        return completedList.includes(itemId);
      }
      const qz = quizzes.find((q) => q._id === itemId);
      const sub = tutorials.find((s) => s.moduleId === qz?.moduleId);
      return sub ? (completedList.includes(qz._id) || completedList.includes(sub._id)) : false;
    } else if (itemType === "final-assignment") {
      if (itemId === `${courseId}-final-1`) {
        return completedList.includes(itemId);
      }
      return completedList.includes(itemId);
    }
    return false;
  };

  const toggleSection = (sectionName) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const renderMarkCompleteBtn = (itemId, itemType) => {
    const done = isCompleted(itemId, itemType);
    if (done) {
      return (
        <button className="btn-complete-sub completed" disabled style={{ opacity: 0.75 }}>
          ✓ Completed
        </button>
      );
    }
    return (
      <button
        className="btn-complete-sub"
        onClick={() => handleMarkComplete(itemId, itemType)}
        disabled={submittingProgress}
      >
        {submittingProgress ? "Recording progress..." : "Mark Complete"}
      </button>
    );
  };

  // Progress: ALWAYS from backend enrollment object — single source of truth
  const progress = enrollment?.progress !== undefined ? enrollment.progress : 0;

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

  const isCertificateUnlocked = () => {
    const allTutsDone = tutorials.every((t) => isCompleted(t._id, "tutorial"));
    const allVidsDone = videos.every((v) => isCompleted(v._id, "video"));
    const allAsmsDone = assignments.every((a) => isCompleted(a._id, "assignment"));
    const allQuizzesDone = quizzes.every((q) => {
      const quizId = q._id;
      const userId = user?._id || user?.email || "guest";
      const savedAttemptStr = localStorage.getItem(`${userId}_${quizId}`);
      if (savedAttemptStr) {
        const attempt = JSON.parse(savedAttemptStr);
        return attempt.passed;
      }
      return isCompleted(quizId, "quiz");
    });
    const finalDone = finalAssignments.every((f) => isCompleted(f._id, "final-assignment"));

    return allTutsDone && allVidsDone && allAsmsDone && allQuizzesDone && finalDone && progress === 100;
  };

  const isUnlocked = isCertificateUnlocked();

  const getFlatSequence = () => {
    const list = [];
    tutorials.forEach((item) => list.push({ type: "tutorial", data: item }));
    videos.forEach((item) => list.push({ type: "video", data: item }));
    assignments.forEach((item) => list.push({ type: "assignment", data: item }));
    quizzes.forEach((item) => list.push({ type: "quiz", data: item }));
    finalAssignments.forEach((item) => list.push({ type: "final-assignment", data: item }));
    return list;
  };

  const hasNextItem = () => {
    if (!activeItem) return false;
    const seq = getFlatSequence();
    const idx = seq.findIndex((item) => item.type === activeItem.type && item.data._id === activeItem.data._id);
    return idx !== -1 && idx < seq.length - 1;
  };

  const handleNextItem = () => {
    if (!activeItem) return;
    const seq = getFlatSequence();
    const idx = seq.findIndex((item) => item.type === activeItem.type && item.data._id === activeItem.data._id);
    if (idx !== -1 && idx < seq.length - 1) {
      setActiveItem(seq[idx + 1]);
    }
  };

  if (loading) {
    return <PageLoader text="Preparing Course Player..." />;
  }

  return (
    <div className="lms-player-container">
      {/* Left Panel: Syllabus Roadmap Sidebar */}
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

        <nav className="sidebar-syllabus">
          {/* Tutorials Section */}
          <div className="module-accordion">
            <button className="module-trigger" onClick={() => toggleSection("tutorials")}>
              <span className="module-title">{sectionsExpanded.tutorials ? "▼" : "▶"} Tutorials</span>
            </button>
            {sectionsExpanded.tutorials && (
              <ul className="submodule-list">
                {normalizeArray(tutorials).map((tut) => {
                  const isSelected = activeItem?.type === "tutorial" && activeItem.data._id === tut._id;
                  const done = isCompleted(tut._id, "tutorial");
                  return (
                    <li key={tut._id}>
                      <button
                        className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""}`}
                        onClick={() => setActiveItem({ type: "tutorial", data: tut })}
                      >
                        <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                          {done ? "✓" : isSelected ? "→" : "•"}
                        </span>
                        <span className="item-text">{tut.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Videos Section */}
          <div className="module-accordion">
            <button className="module-trigger" onClick={() => toggleSection("videos")}>
              <span className="module-title">{sectionsExpanded.videos ? "▼" : "▶"} Videos</span>
            </button>
            {sectionsExpanded.videos && (
              <ul className="submodule-list">
                {videos.length === 0 ? (
                  <li className="empty-submodules" style={{ padding: "0.75rem 2rem", fontSize: "0.75rem", color: "#64748b" }}>No videos available</li>
                ) : (
                  normalizeArray(videos).map((vid) => {
                    const isSelected = activeItem?.type === "video" && activeItem.data._id === vid._id;
                    const done = isCompleted(vid._id, "video");
                    return (
                      <li key={vid._id}>
                        <button
                          className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""}`}
                          onClick={() => setActiveItem({ type: "video", data: vid })}
                        >
                          <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                            {done ? "✓" : isSelected ? "→" : "▶"}
                          </span>
                          <span className="item-text">{vid.title}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Assignments Section */}
          <div className="module-accordion">
            <button className="module-trigger" onClick={() => toggleSection("assignments")}>
              <span className="module-title">{sectionsExpanded.assignments ? "▼" : "▶"} Assignments</span>
            </button>
            {sectionsExpanded.assignments && (
              <ul className="submodule-list">
                {assignments.length === 0 ? (
                  <li className="empty-submodules" style={{ padding: "0.75rem 2rem", fontSize: "0.75rem", color: "#64748b" }}>No assignments available</li>
                ) : (
                  normalizeArray(assignments).map((asm) => {
                    const isSelected = activeItem?.type === "assignment" && activeItem.data._id === asm._id;
                    const done = isCompleted(asm._id, "assignment");
                    return (
                      <li key={asm._id}>
                        <button
                          className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""}`}
                          onClick={() => setActiveItem({ type: "assignment", data: asm })}
                        >
                          <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                            {done ? "✓" : isSelected ? "→" : "📝"}
                          </span>
                          <span className="item-text">{asm.title}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Quizzes Section */}
          <div className="module-accordion">
            <button className="module-trigger" onClick={() => toggleSection("quizzes")}>
              <span className="module-title">{sectionsExpanded.quizzes ? "▼" : "▶"} Quizzes</span>
            </button>
            {sectionsExpanded.quizzes && (
              <ul className="submodule-list">
                {quizzes.length === 0 ? (
                  <li className="empty-submodules" style={{ padding: "0.75rem 2rem", fontSize: "0.75rem", color: "#64748b" }}>No quizzes available</li>
                ) : (
                  normalizeArray(quizzes).map((qz) => {
                    const isSelected = activeItem?.type === "quiz" && activeItem.data._id === qz._id;
                    const done = isCompleted(qz._id, "quiz");
                    return (
                      <li key={qz._id}>
                        <button
                          className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""}`}
                          onClick={() => setActiveItem({ type: "quiz", data: qz })}
                        >
                          <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                            {done ? "✓" : isSelected ? "→" : "❓"}
                          </span>
                          <span className="item-text">{qz.title || qz.name || "Quiz"}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Final Assignment Section */}
          <div className="module-accordion">
            <button className="module-trigger" onClick={() => toggleSection("finalAssignment")}>
              <span className="module-title">{sectionsExpanded.finalAssignment ? "▼" : "▶"} Final Assignment</span>
            </button>
            {sectionsExpanded.finalAssignment && (
              <ul className="submodule-list">
                {finalAssignments.length === 0 ? (
                  <li className="empty-submodules" style={{ padding: "0.75rem 2rem", fontSize: "0.75rem", color: "#64748b" }}>No final assignment available</li>
                ) : (
                  normalizeArray(finalAssignments).map((final) => {
                    const isSelected = activeItem?.type === "final-assignment" && activeItem.data._id === final._id;
                    const done = isCompleted(final._id, "final-assignment");
                    return (
                      <li key={final._id}>
                        <button
                          className={`submodule-item-row ${isSelected ? "active" : ""} ${done ? "completed" : ""}`}
                          onClick={() => setActiveItem({ type: "final-assignment", data: final })}
                        >
                          <span className={`icon-prefix ${done ? "completed-tick" : ""}`}>
                            {done ? "✓" : isSelected ? "→" : "📋"}
                          </span>
                          <span className="item-text">{final.title || final.name || "Final Task"}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Certificate row */}
          <div className="sidebar-certificate-row">
            {!isUnlocked ? (
              <div className="certificate-item locked" title="Complete all course requirements to unlock">
                <span className="icon-prefix">🔒</span>
                <span className="item-text">Complete all course requirements to unlock</span>
              </div>
            ) : certificateData ? (
              <button
                className={`certificate-item unlocked ${activeItem?.type === "certificate" ? "active" : ""}`}
                onClick={() => setActiveItem({ type: "certificate", data: certificateData })}
              >
                <span className="icon-prefix">🏆</span>
                <span className="item-text">View Certificate</span>
              </button>
            ) : (
              <button
                className={`certificate-item unlocked claimable ${activeItem?.type === "certificate-form" ? "active" : ""}`}
                onClick={() => setActiveItem({ type: "certificate-form", data: {} })}
                disabled={submittingProgress}
              >
                <span className="icon-prefix">🏆</span>
                <span className="item-text">Generate Certificate</span>
              </button>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-leave-player" onClick={() => navigate(`/course/${courseId}`)}>
            ← Leave Player
          </button>
        </div>
      </aside>

      {/* Right Panel: Content viewport area */}
      <main className="player-content-area">
        {/* Top Header Row */}
        <header className="player-top-bar">
          <h2 className="player-top-course-title">{cleanCourseName(course?.name, course?.description)}</h2>
          <div className="player-header-progress">
            <span>Progress: {progress}%</span>
            <ProgressBar progress={progress} />
          </div>
        </header>

        {/* Content Viewport */}
        <div className="player-viewport">
          {activeItem ? (
            <div className="submodule-content-card">
              {/* Render Tutorials View */}
              {activeItem.type === "tutorial" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag">📖 Tutorial</span>
                    <h1>{activeItem.data.name}</h1>
                  </div>
                  <div className="tab-viewport-body">
                    <div className="tutorial-markup">
                      <h3>Lesson Walkthrough</h3>
                      <p>
                        {safeRender(
                          activeItem.data.content ||
                          activeItem.data.description ||
                          (() => {
                            const fb = getFallbackContent(course?.title || course?.name || "", courseId);
                            const fbSub = fb.subModules?.find(s => s.name === activeItem.data.name);
                            return fbSub?.content || "";
                          })()
                        )}
                      </p>
                      <div className="tutorial-box">
                        💡 <strong>LernX Tip:</strong> Try recreating concepts and commands covered in these materials locally in your environment.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Render Video View */}
              {activeItem.type === "video" && (() => {
                const currentTopic = tutorials.find(t => t._id === activeItem.data.subModuleId) || {};
                const topicTitle = currentTopic.name || currentTopic.title || activeItem.data.title;
                const embedUrl = getVideoEmbedUrl(activeItem.data, currentTopic);
                return (
                  <div className="submodule-detail-body">
                    <div className="submodule-header">
                      <span className="current-node-tag">🎥 Video Lesson</span>
                      <h1>{topicTitle}</h1>
                      <div className="video-meta">Duration: {activeItem.data.duration || "N/A"}</div>
                    </div>
                    <div className="tab-viewport-body">
                      {embedUrl ? (
                        <div 
                          className="video-player-frame"
                          onMouseEnter={() => document.body.classList.add('hide-custom-cursor')}
                          onMouseLeave={() => document.body.classList.remove('hide-custom-cursor')}
                        >
                          <iframe
                            className="html5-video-player"
                            src={embedUrl}
                            title={topicTitle}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            border="0"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="video-player-frame empty-video-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '3rem 1rem', borderRadius: '12px' }}>
                          <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎦</span>
                          <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Video Unavailable</h3>
                          <p style={{ marginTop: '0.5rem', textAlign: 'center', maxWidth: '400px' }}>This video content is currently being processed or prepared. Please review the lesson notes or continue to the next module.</p>
                        </div>
                      )}
                      <p className="video-description-text" style={{ marginTop: "1rem", color: "#4b5563" }}>
                        {activeItem.data.description || "Watch the video presentation fully before checking completions."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Render Assignment View */}
              {activeItem.type === "assignment" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag">📝 Assignment</span>
                    <h1>{activeItem.data.title}</h1>
                    <div className="video-meta">Max Marks: {activeItem.data.maxMarks || 100}</div>
                  </div>
                  <div className="tab-viewport-body">
                    <div className="assignment-card-item" style={{ marginBottom: "1.5rem" }}>
                      <p className="asm-desc">{activeItem.data.description}</p>
                    </div>

                    {isCompleted(activeItem.data._id, "assignment") ? (
                      <div className="completed-success-banner" style={{ marginTop: "1.5rem" }}>
                        <span className="success-icon">✓</span>
                        <span>Assignment submitted successfully! Marked as complete.</span>
                      </div>
                    ) : (
                      <div className="assignment-submission-form" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Submit Your Work</h3>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Option A: Write your answer here...</label>
                          <textarea
                            className="answer-area"
                            placeholder="Type your answer or submission notes here..."
                            rows="5"
                            value={asmText}
                            onChange={(e) => setAsmText(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.95rem", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                          ></textarea>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0.5rem 0", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                          <span style={{ background: "var(--bg-primary)", padding: "0 0.5rem", position: "relative", zIndex: 1 }}>OR</span>
                          <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", width: "100%", position: "absolute", zIndex: 0 }} />
                        </div>

                        <div className="form-group">
                          <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Option B: Paste Google Drive link</label>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://drive.google.com/..."
                            value={asmLink}
                            onChange={(e) => setAsmLink(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.95rem", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
                          />
                        </div>

                        <div style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600", alignSelf: "center" }}>OR</div>

                        <div className="form-group">
                          <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Upload File</label>
                          <input
                            type="file"
                            className="form-input"
                            accept=".pdf,.zip,.rar,.txt"
                            onChange={(e) => setAsmFile(e.target.files[0])}
                            style={{ marginTop: "0.25rem" }}
                          />
                          {asmFile && (
                            <span style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem" }}>
                              Selected file: {asmFile.name}
                            </span>
                          )}
                        </div>

                        <button
                          className="btn-complete-sub"
                          onClick={handleSubmitAssignment}
                          disabled={submittingProgress}
                          style={{ marginTop: "1rem", alignSelf: "flex-end" }}
                        >
                          {submittingProgress ? "Submitting..." : "Submit Assignment"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Render Quiz View */}
              {activeItem.type === "quiz" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag">❓ Module Quiz</span>
                    <h1>{activeItem.data.title || "Topic assessment"}</h1>
                  </div>
                  <div className="tab-viewport-body">
                    {quizAttempt && !isReattempting ? (
                      <div className="quiz-result-dashboard" style={{ display: "flex", justifyContent: "center" }}>
                        <div className="scorecard-card" style={{ border: quizAttempt.passed ? "2px solid #10b981" : "2px solid #ef4444", borderRadius: "12px", padding: "2rem", backgroundColor: "var(--card-bg, var(--bg-primary))", width: "100%", maxWidth: "420px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                          <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-primary)" }}>Quiz Results</h3>
                          <div style={{ textAlign: "left", margin: "1rem auto", display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "280px", color: "var(--text-secondary)" }}>
                            <div>Total Questions: <strong style={{ color: "var(--text-primary)" }}>{quizAttempt.total}</strong></div>
                            <div>Correct Answers: <strong style={{ color: "var(--text-primary)" }}>{quizAttempt.score}</strong></div>
                            <div>Your Score: <strong style={{ color: "var(--text-primary)" }}>{quizAttempt.score}/{quizAttempt.total}</strong></div>
                            <div>Percentage: <strong style={{ color: "var(--text-primary)" }}>{quizAttempt.percentage}%</strong></div>
                          </div>
                          <div className={`quiz-status-msg ${quizAttempt.passed ? "pass" : "fail"}`} style={{ color: quizAttempt.passed ? "#10b981" : "#ef4444", fontWeight: "800", margin: "1.5rem 0", fontSize: "1.25rem" }}>
                            {quizAttempt.passed ? "✓ Quiz Passed" : "✗ Try Again"}
                          </div>
                          <button
                            className="btn-reattempt-quiz"
                            onClick={() => setIsReattempting(true)}
                            style={{ marginTop: "1rem", padding: "0.75rem 2rem", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-color, #4f46e5)", color: "white", fontWeight: "600", cursor: "pointer" }}
                          >
                            Reattempt Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {activeItem.data.questions && activeItem.data.questions.length > 0 ? (
                          activeItem.data.questions.map((q, qIndex) => (
                            <div className="quiz-card" key={qIndex} style={{ marginBottom: "1rem", padding: "0.75rem 1rem", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                              <h4 style={{ marginBottom: "0.5rem", fontSize: "0.95rem", color: "var(--text-primary)" }}>{qIndex + 1}. {q.question}</h4>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                {q.options?.map((opt, oIndex) => (
                                  <label key={oIndex} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                                    <input
                                      type="radio"
                                      name={`quiz-${activeItem.data._id}-${qIndex}`}
                                      value={opt}
                                      checked={quizAnswers[`${activeItem.data._id}-${qIndex}`] === opt}
                                      onChange={() =>
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [`${activeItem.data._id}-${qIndex}`]: opt,
                                        }))
                                      }
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>No questions configured for this quiz.</p>
                        )}
                        {activeItem.data.questions && activeItem.data.questions.length > 0 && (
                          <div className="content-item-action-row" style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              className="btn-complete-sub"
                              onClick={handleSubmitQuiz}
                            >
                              Submit Quiz
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Render Final Assignment View */}
              {activeItem.type === "final-assignment" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag">🎓 Final Course Assessment</span>
                    <h1>{activeItem.data.title || activeItem.data.name || "Final Exam"}</h1>
                    {activeItem.data.maxMarks && (
                      <div className="video-meta">Max Marks: {activeItem.data.maxMarks}</div>
                    )}
                  </div>
                  <div className="tab-viewport-body">
                    <div className="assignment-card-item">
                      <p className="asm-desc">
                        {activeItem.data.description ||
                          "Complete the final verification project to earn your LernX digital completion certificate."}
                      </p>
                    </div>
                    {isCompleted(activeItem.data._id, "final-assignment") || submittedFinal ? (
                      <div className="completed-success-banner" style={{ marginTop: "1.5rem" }}>
                        <span className="success-icon">✓</span>
                        <span>Assignment submitted successfully! Your progress is now complete. Go to the sidebar to generate your certificate.</span>
                      </div>
                    ) : (
                      <>
                        <div className="assignment-upload-area" style={{ marginTop: "1.5rem" }}>
                          <div className="form-group" style={{ marginBottom: "1rem" }}>
                            <label style={{ fontWeight: "600" }}>Google Drive / Submission Link</label>
                            <input
                              type="url"
                              className="form-input"
                              placeholder="Paste your Google Drive link or project repository URL here..."
                              value={submissionLink}
                              onChange={(e) => setSubmissionLink(e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ fontWeight: "600" }}>Upload Submission File (ZIP/PDF)</label>
                            <input
                              type="file"
                              className="form-input"
                              accept=".pdf,.zip,.rar"
                              onChange={(e) => setSubmissionFile(e.target.files[0])}
                              style={{ marginTop: "0.25rem" }}
                            />
                            {submissionFile && (
                              <span style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem" }}>
                                Selected file: {submissionFile.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="content-item-action-row" style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="btn-complete-sub"
                            onClick={handleSubmitFinalAssignment}
                            disabled={submittingProgress}
                          >
                            {submittingProgress ? "Submitting..." : "Submit Final Assignment"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Render Certificate View */}
              {activeItem.type === "certificate" && (
                <div className="submodule-detail-body">
                  <div className="submodule-header">
                    <span className="current-node-tag">🏆 LernX Digital Credential</span>
                    <h1>Verification Code: {activeItem.data._id}</h1>
                  </div>
                  <div className="tab-viewport-body" style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
                      Congratulations! You have completed all syllabus coordinates for this course.
                    </p>
                    <button
                      className="btn-primary-action btn-continue"
                      onClick={() => navigate("/certificate", { state: { cert: activeItem.data, course } })}
                      style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}
                    >
                      View Certificate Page
                    </button>
                  </div>
                </div>
              )}

              {/* Render Certificate Form View */}
              {activeItem.type === "certificate-form" && (
                <div className="submodule-detail-body">
                  <div className="certificate-generation-form-card">
                    <h2>🏆 Request Digital Certificate</h2>
                    
                    {certificateData ? (
                      <div className="success-message" style={{ textAlign: "center", padding: "1.5rem" }}>
                        <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                          ✓ Certificate successfully generated!
                        </p>
                        <button
                          className="btn-primary-action btn-continue"
                          onClick={() => {
                            const cleanedCourse = { ...course, name: cleanCourseName(course?.name, course?.description) };
                            navigate("/certificate/preview", { state: { cert: certificateData, course: cleanedCourse } });
                          }}
                          style={{ padding: "0.85rem 2rem", fontSize: "1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px" }}
                        >
                          View Certificate
                        </button>
                      </div>
                    ) : (
                      <>
                        <p>Enter your academic coordinates to generate your verified digital completion credential.</p>
                        
                        <form onSubmit={handleFormGenerateCert}>
                      <div className="form-group">
                        <label>Student Full Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Shashank Kumar"
                          value={certFormName}
                          onChange={(e) => setCertFormName(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>College / Institution Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Stanford University"
                          value={certFormCollege}
                          onChange={(e) => setCertFormCollege(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Graduation Year</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. 2026"
                          value={certFormYear}
                          onChange={(e) => setCertFormYear(e.target.value)}
                        />
                      </div>

                       <div className="form-group">
                        <label>Course</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cleanCourseName(course?.name, course?.description) || ""}
                          disabled
                          style={{ backgroundColor: "#f1f5f9" }}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="btn-submit-cert"
                        disabled={submittingProgress}
                      >
                        {submittingProgress ? "Generating Certificate..." : "Generate Digital Certificate"}
                      </button>
                    </form>
                    </>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Navigation Bar */}
              {activeItem.type !== "certificate" && activeItem.type !== "certificate-form" && (
                <div className="player-bottom-navigation-bar">
                  <button className="btn-player-back-nav" onClick={() => navigate(`/course/${courseId}`)}>
                    ← Back to Course Details
                  </button>
                  
                  <div className="player-nav-right-buttons">
                    {activeItem.type !== "quiz" && activeItem.type !== "final-assignment" && renderMarkCompleteBtn(activeItem.data._id, activeItem.type)}
                    
                    {hasNextItem() && (
                      <button className="btn-player-next" onClick={handleNextItem}>
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="player-welcome-panel">
              <div className="welcome-player-card">
                <div className="welcome-icon">⚡</div>
                <h1>Welcome to {cleanCourseName(course?.name, course?.description) || "LernX Platform"}</h1>
                <p>Select any item from the roadmap sidebar to start learning.</p>
                <div className="welcome-prog-box">
                  <span>Course Completed:</span>
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
            <span className="congrats-emoji">🎉</span>
            <h2>Congratulations!</h2>
            <p>You have successfully completed</p>
            <h3>{cleanCourseName(course?.name, course?.description)}</h3>
            <p style={{ fontWeight: "600", color: "#4f46e5", margin: "0.5rem 0 1.5rem 0", fontSize: "1.1rem" }}>Progress: 100%</p>
            <button
              className="btn-congrats-generate-cert"
              onClick={() => {
                setShowCongrats(false);
                setActiveItem({ type: "certificate-form" });
              }}
            >
              Generate Certificate
            </button>
          </div>
        </div>
      )}

      {/* Certificate Success Modal */}
      {showCertSuccess && (
        <div className="congrats-modal-overlay">
          <div className="congrats-modal-card">
            <span className="congrats-emoji">🎉</span>
            <h2>Certificate Generated Successfully!</h2>
            <p>Your digital credential for</p>
            <h3>{cleanCourseName(course?.name, course?.description)}</h3>
            <p style={{ fontWeight: "600", color: "#10b981", margin: "0.5rem 0 1.5rem 0", fontSize: "1rem" }}>
              Available in your profile
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn-congrats-generate-cert"
                onClick={() => {
                  setShowCertSuccess(false);
                  navigate("/profile");
                }}
              >
                View Certificate
              </button>
              <button
                className="btn-congrats-generate-cert"
                style={{ background: "var(--bg-secondary, #f1f5f9)", color: "var(--text-primary, #1e293b)", boxShadow: "none" }}
                onClick={() => setShowCertSuccess(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Feature - only shown for videos */}
      {activeItem?.type === "video" && (
        <div className="player-notes-wrapper">
          <div className="learnx-tooltip notes-tooltip">Lesson Notes</div>
          <button className="notes-launcher" onClick={() => setIsNotesOpen(!isNotesOpen)}>
            <span className="robot-emoji">📝</span>
          </button>
          
          <div className={`notes-panel ${isNotesOpen ? "open" : "closed"}`}>
            <div className="notes-header">
              <div className="notes-header-info">
                <h3>📝 My Notes</h3>
                <p>Private lesson notes</p>
              </div>
              <button className="notes-close" onClick={() => setIsNotesOpen(false)}>&times;</button>
            </div>
            
            <div className="notes-body">
              {(() => {
                const parentSubModule = tutorials.find(t => t._id === activeItem.data.subModuleId);
                const parentModuleId = parentSubModule?.moduleId;
                const parentModule = modules.find(m => m._id === parentModuleId);
                const moduleNotes = parentModule?.notes;
                
                return moduleNotes ? (
                  <div className="module-provided-notes">
                    <h4>Course Material</h4>
                    <p>{moduleNotes}</p>
                  </div>
                ) : null;
              })()}
              
              <textarea 
                className="notes-textarea" 
                placeholder="Type your private notes here... (Auto-saved)"
                value={notesContent}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setNotesContent(newContent);
                  const videoId = activeItem.data._id;
                  const userId = user?._id || user?.email || "guest";
                  // Debounced auto-save: waits 800ms after user stops typing
                  if (notesSaveTimerRef.current) clearTimeout(notesSaveTimerRef.current);
                  notesSaveTimerRef.current = setTimeout(() => {
                    saveNote(userId, courseId, videoId, newContent);
                  }, 800);
                }}
              />
            </div>
            <div className="notes-footer">
              <span className="auto-save-text">✓ Auto-saved</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursePlayer;
